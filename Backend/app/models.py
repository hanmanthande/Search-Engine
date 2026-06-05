from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    username        = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("OCRDocument", back_populates="owner", cascade="all, delete-orphan")


class OCRDocument(Base):
    __tablename__ = "ocr_documents"

    id         = Column(Integer, primary_key=True, index=True)
    filename   = Column(String(255), nullable=False)
    s3_key     = Column(String(512), nullable=False)
    file_size  = Column(Integer, nullable=True)
    mime_type  = Column(String(100), nullable=True)
    page_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    owner  = relationship("User", back_populates="documents")
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