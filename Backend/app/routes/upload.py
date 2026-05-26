import logging
import uuid
import os
from typing import Optional
 
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
 
from app.database import get_db
from app.models import OCRDocument, OCRChunk
from app.schemas import (
    UploadResponse,
    SearchResponse,
    SearchResult,
    AskResponse,
    DocumentListResponse,
    DocumentInfo,
)
from app.services.s3_service import upload_file_to_s3, generate_presigned_url, delete_file_from_s3
from app.services.ocr_service import extract_text_from_image_bytes, extract_text_from_pdf_bytes
from app.services.chunk_service import split_text
from app.services.embedding_service import generate_embedding
from app.services.rag_service import retrieve_context, retrieve_context_with_metadata
from app.services.langchain_service import generate_rag_answer
from app.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB
 
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["documents"])
 
 
# ─────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────
 
def _get_nearby_context(db: Session, document_id: int, chunk_number: int, window: int = 1) -> str:
    """Fetches the matched chunk plus `window` chunks on each side for richer context."""
    nearby = (
        db.query(OCRChunk)
        .filter(
            OCRChunk.document_id == document_id,
            OCRChunk.chunk_number >= max(1, chunk_number - window),
            OCRChunk.chunk_number <= chunk_number + window,
        )
        .order_by(OCRChunk.chunk_number)
        .all()
    )
    return " ".join(c.content for c in nearby)
 
 
# ─────────────────────────────────────────────────────────────────
# POST /api/upload
# ─────────────────────────────────────────────────────────────────
 
@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # ── Validate extension ─────────────────────────────────
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
 
    # ── Read & validate size ───────────────────────────────
    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_SIZE_MB} MB.",
        )
 
    # ── Determine MIME type ────────────────────────────────
    content_type = file.content_type or ("application/pdf" if ext == ".pdf" else "image/jpeg")
 
    # ── Upload to S3 ───────────────────────────────────────
    unique_filename = f"{uuid.uuid4()}{ext}"
    try:
        s3_key = upload_file_to_s3(file_bytes, unique_filename, content_type)
    except RuntimeError as e:
        logger.error("S3 upload error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
 
    # ── Save document record ───────────────────────────────
    document = OCRDocument(
        filename=file.filename,
        s3_key=s3_key,
        file_size=len(file_bytes),
        mime_type=content_type,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
 
    # ── OCR + chunk + embed ────────────────────────────────
    chunk_count = 0
    try:
        if ext == ".pdf":
            pages = extract_text_from_pdf_bytes(file_bytes)
            document.page_count = len(pages)
 
            for page_num, page_text in enumerate(pages, start=1):
                chunks = split_text(page_text)
                for chunk_num, chunk in enumerate(chunks, start=1):
                    if not chunk.strip():
                        continue
                    embedding = generate_embedding(chunk)
                    db.add(OCRChunk(
                        document_id=document.id,
                        page_number=page_num,
                        chunk_number=chunk_num,
                        content=chunk,
                        embedding=embedding,
                    ))
                    chunk_count += 1
 
        else:
            page_text = extract_text_from_image_bytes(file_bytes)
            document.page_count = 1
            chunks = split_text(page_text)
 
            for chunk_num, chunk in enumerate(chunks, start=1):
                if not chunk.strip():
                    continue
                embedding = generate_embedding(chunk)
                db.add(OCRChunk(
                    document_id=document.id,
                    page_number=1,
                    chunk_number=chunk_num,
                    content=chunk,
                    embedding=embedding,
                ))
                chunk_count += 1
 
        db.commit()
 
    except Exception as e:
        # Roll back document record if processing fails
        db.rollback()
        try:
            delete_file_from_s3(s3_key)
        except Exception:
            pass
        logger.error("Processing failed for %s: %s", file.filename, e)
        raise HTTPException(status_code=500, detail=f"Document processing failed: {e}")
 
    logger.info("Processed '%s' → %d chunks", file.filename, chunk_count)
    return UploadResponse(
        document_id=document.id,
        filename=file.filename,
        s3_key=s3_key,
        file_size=len(file_bytes),
        page_count=document.page_count or 1,
        chunk_count=chunk_count,
        message=f"Document uploaded and processed successfully ({chunk_count} chunks created).",
    )
 
 
# ─────────────────────────────────────────────────────────────────
# GET /api/search/keyword
# ─────────────────────────────────────────────────────────────────
 
@router.get("/search/keyword", response_model=SearchResponse)
def keyword_search(
    query: str = Query(..., min_length=1, max_length=500),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
 
    matches = (
        db.query(OCRChunk)
        .join(OCRDocument)
        .filter(OCRChunk.content.ilike(f"%{query}%"))
        .offset(offset)
        .limit(limit)
        .all()
    )
 
    results: list[SearchResult] = []
    seen_contents: set[str] = set()
 
    for chunk in matches:
        if chunk.content in seen_contents:
            continue
        seen_contents.add(chunk.content)
 
        context = _get_nearby_context(db, chunk.document_id, chunk.chunk_number)
        results.append(SearchResult(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            filename=chunk.document.filename,
            s3_key=chunk.document.s3_key,
            page=chunk.page_number,
            chunk_number=chunk.chunk_number,
            matched_text=chunk.content,
            context=context,
        ))
 
    return SearchResponse(query=query, results=results, total=len(results))
 
 
# ─────────────────────────────────────────────────────────────────
# GET /api/search/semantic
# ─────────────────────────────────────────────────────────────────
 
@router.get("/search/semantic", response_model=SearchResponse)
def semantic_search(
    query: str = Query(..., min_length=1, max_length=500),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
 
    try:
        query_embedding = generate_embedding(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {e}")
 
    try:
        raw_results = retrieve_context_with_metadata(query_embedding, db, top_k=limit)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    results: list[SearchResult] = []
    seen: set[str] = set()
 
    for row in raw_results:
        if row["content"] in seen:
            continue
        seen.add(row["content"])
        context = _get_nearby_context(db, row["document_id"], row["chunk_number"])
        results.append(SearchResult(
            chunk_id=row["chunk_id"],
            document_id=row["document_id"],
            filename=row["filename"],
            s3_key=row["s3_key"],
            page=row["page"],
            chunk_number=row["chunk_number"],
            matched_text=row["content"],
            context=context,
            distance=row["distance"],
        ))
 
    return SearchResponse(query=query, results=results, total=len(results))
 
 
# ─────────────────────────────────────────────────────────────────
# GET /api/ask
# ─────────────────────────────────────────────────────────────────
 
@router.get("/ask", response_model=AskResponse)
def ask_question(
    query: str = Query(..., min_length=1, max_length=1000),
    top_k: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
):
    try:
        query_embedding = generate_embedding(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {e}")
 
    try:
        context_chunks = retrieve_context(query_embedding, db, top_k=top_k)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    try:
        answer = generate_rag_answer(question=query, context_chunks=context_chunks)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    return AskResponse(question=query, answer=answer, sources=context_chunks)
 
 
# ─────────────────────────────────────────────────────────────────
# GET /api/documents
# ─────────────────────────────────────────────────────────────────
 
@router.get("/documents", response_model=DocumentListResponse)
def list_documents(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(OCRDocument.id)).scalar()
    documents = (
        db.query(OCRDocument)
        .order_by(OCRDocument.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
 
    doc_infos: list[DocumentInfo] = []
    for doc in documents:
        chunk_count = db.query(func.count(OCRChunk.id)).filter(OCRChunk.document_id == doc.id).scalar()
        doc_infos.append(DocumentInfo(
            id=doc.id,
            filename=doc.filename,
            s3_key=doc.s3_key,
            file_size=doc.file_size,
            page_count=doc.page_count,
            chunk_count=chunk_count,
            created_at=doc.created_at,
        ))
 
    return DocumentListResponse(documents=doc_infos, total=total)
 
 
# ─────────────────────────────────────────────────────────────────
# GET /api/documents/{document_id}/url
# ─────────────────────────────────────────────────────────────────
 
@router.get("/documents/{document_id}/url")
def get_document_url(
    document_id: int,
    expires_in: int = Query(3600, ge=60, le=86400),
    db: Session = Depends(get_db),
):
    """Returns a temporary presigned S3 URL to view/download the original file."""
    doc = db.query(OCRDocument).filter(OCRDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
 
    try:
        url = generate_presigned_url(doc.s3_key, expires_in=expires_in)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
 
    return {"document_id": document_id, "filename": doc.filename, "url": url, "expires_in": expires_in}
 
 
# ─────────────────────────────────────────────────────────────────
# DELETE /api/documents/{document_id}
# ─────────────────────────────────────────────────────────────────
 
@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    doc = db.query(OCRDocument).filter(OCRDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
 
    s3_key = doc.s3_key
    db.delete(doc)
    db.commit()
 
    try:
        delete_file_from_s3(s3_key)
    except RuntimeError as e:
        logger.warning("DB record deleted but S3 delete failed for %s: %s", s3_key, e)
 
    return {"message": f"Document '{doc.filename}' deleted successfully."}