from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base
 
 
class OCRDocument(Base):
    __tablename__ = "ocr_documents"
 
    id          = Column(Integer, primary_key=True, index=True)
    filename    = Column(String(255), nullable=False)
    s3_key      = Column(String(512), nullable=False)          # e.g. uploads/uuid.pdf
    file_size   = Column(Integer, nullable=True)               # bytes
    mime_type   = Column(String(100), nullable=True)
    page_count  = Column(Integer, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
 
    chunks = relationship("OCRChunk", back_populates="document", cascade="all, delete-orphan")
 
 
class OCRChunk(Base):
    __tablename__ = "ocr_chunks"
 
    id           = Column(Integer, primary_key=True, index=True)
    document_id  = Column(Integer, ForeignKey("ocr_documents.id", ondelete="CASCADE"))
    page_number  = Column(Integer)
    chunk_number = Column(Integer)
    content      = Column(Text)
    embedding    = Column(Vector(384))
 
    document = relationship("OCRDocument", back_populates="chunks")