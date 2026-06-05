from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes.upload import router as upload_router
from app.routes.auth import router as auth_router
from app.config import ALLOWED_ORIGINS

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OCR Document Extractor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)    # /api/auth/*
app.include_router(upload_router)  # /api/*


@app.get("/")
def health_check():
    return {"status": "running", "service": "OCR Document Extractor"}