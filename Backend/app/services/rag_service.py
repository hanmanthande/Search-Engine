import logging
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)


def retrieve_context(
    query_embedding: list[float],
    db: Session,
    top_k: int = 5,
    owner_id: Optional[int] = None,
) -> list[str]:
    if owner_id is not None:
        sql = text("""
            SELECT c.content
            FROM ocr_chunks c
            JOIN ocr_documents d ON c.document_id = d.id
            WHERE d.owner_id = :owner_id
            ORDER BY c.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)
        params = {"embedding": str(query_embedding), "top_k": top_k, "owner_id": owner_id}
    else:
        sql = text("""
            SELECT content FROM ocr_chunks
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)
        params = {"embedding": str(query_embedding), "top_k": top_k}

    try:
        results = db.execute(sql, params).fetchall()
        return [row.content for row in results]
    except Exception as e:
        logger.error("Context retrieval failed: %s", e)
        raise RuntimeError(f"Vector search failed: {e}") from e


def retrieve_context_with_metadata(
    query_embedding: list[float],
    db: Session,
    top_k: int = 5,
    owner_id: Optional[int] = None,
) -> list[dict]:
    if owner_id is not None:
        sql = text("""
            SELECT c.id, c.document_id, c.page_number, c.chunk_number, c.content,
                   d.filename, d.s3_key,
                   c.embedding <=> CAST(:embedding AS vector) AS distance
            FROM ocr_chunks c
            JOIN ocr_documents d ON c.document_id = d.id
            WHERE d.owner_id = :owner_id
            ORDER BY c.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)
        params = {"embedding": str(query_embedding), "top_k": top_k, "owner_id": owner_id}
    else:
        sql = text("""
            SELECT c.id, c.document_id, c.page_number, c.chunk_number, c.content,
                   d.filename, d.s3_key,
                   c.embedding <=> CAST(:embedding AS vector) AS distance
            FROM ocr_chunks c
            JOIN ocr_documents d ON c.document_id = d.id
            ORDER BY c.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)
        params = {"embedding": str(query_embedding), "top_k": top_k}

    try:
        rows = db.execute(sql, params).fetchall()
        return [
            {
                "chunk_id": row.id, "document_id": row.document_id,
                "filename": row.filename, "s3_key": row.s3_key,
                "page": row.page_number, "chunk_number": row.chunk_number,
                "content": row.content, "distance": float(row.distance),
            }
            for row in rows
        ]
    except Exception as e:
        logger.error("Semantic search with metadata failed: %s", e)
        raise RuntimeError(f"Semantic search failed: {e}") from e