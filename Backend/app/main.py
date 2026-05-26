from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes.upload import router
from app.config import ALLOWED_ORIGINS

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OCR Document Extractor API")

# CORS configuration
origins = ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)


@app.get("/")
def health_check():
    return {
        "status": "running",
        "service": "OCR Document Extractor"
    }



