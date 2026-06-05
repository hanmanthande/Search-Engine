from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────
class UserRegister(BaseModel):
    email:    EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be at most 50 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserOut(BaseModel):
    id:         int
    email:      str
    username:   str
    is_active:  bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user:          UserOut


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


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
    distance:     Optional[float] = None


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