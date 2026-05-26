import os
from dotenv import load_dotenv
 
load_dotenv()
 
# ── Database ──────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
 
# ── OCR (Tesseract) ───────────────────────────────────────
# On Linux/EC2: leave TESSERACT_PATH unset → uses system PATH
# On Windows:   set TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
TESSERACT_PATH = os.getenv("TESSERACT_PATH")
 
# ── AWS S3 ────────────────────────────────────────────────
AWS_ACCESS_KEY_ID     = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION            = os.getenv("AWS_REGION", "us-east-1")
S3_UPLOADS_BUCKET     = os.getenv("S3_UPLOADS_BUCKET")          # private bucket for files
S3_UPLOADS_PREFIX     = os.getenv("S3_UPLOADS_PREFIX", "uploads") # folder inside bucket
 
# ── LLM (Groq) ────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
 
# ── CORS ──────────────────────────────────────────────────
# Comma-separated list of allowed origins, e.g.:
# ALLOWED_ORIGINS=http://localhost:5173,https://my-frontend.s3-website.amazonaws.com
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]
 
# ── Upload limits ─────────────────────────────────────────
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "20"))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
 
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".webp"}
 
# ── Chunking ──────────────────────────────────────────────
CHUNK_SIZE    = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
