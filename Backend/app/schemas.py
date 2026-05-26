from pydantic import BaseModel
from typing import Optional
from datetime import datetime
 
 
# ── Upload ────────────────────────────────────────────────
class UploadResponse(BaseModel):
    document_id: int
    filename:    str
    s3_key:      str
    file_size:   int
    page_count:  int
    chunk_count: int
    message:     str
 
 
# ── Search ────────────────────────────────────────────────
class SearchResult(BaseModel):
    chunk_id:     int
    document_id:  int
    filename:     str
    s3_key:       str
    page:         int
    chunk_number: int
    matched_text: str
    context:      str
    distance:     Optional[float] = None   # only for semantic search
 
 
class SearchResponse(BaseModel):
    query:   str
    results: list[SearchResult]
    total:   int
 
 
# ── Ask / RAG ─────────────────────────────────────────────
class AskResponse(BaseModel):
    question: str
    answer:   str
    sources:  list[str]
 
 
# ── Document list ─────────────────────────────────────────
class DocumentInfo(BaseModel):
    id:          int
    filename:    str
    s3_key:      str
    file_size:   Optional[int]
    page_count:  Optional[int]
    chunk_count: int
    created_at:  Optional[datetime]
 
    class Config:
        from_attributes = True
 
 
class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total:     int