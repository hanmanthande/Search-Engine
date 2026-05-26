import io
import logging
import tempfile
import os
from PIL import Image
import pytesseract
from pdf2image import convert_from_bytes
from app.config import TESSERACT_PATH
 
logger = logging.getLogger(__name__)
 
# Only override the tesseract path when explicitly set (Windows dev machines).
# On Linux/EC2 with apt-installed tesseract, leave it as None → uses system PATH.
if TESSERACT_PATH:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
 
 
def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """
    Runs OCR on raw image bytes (PNG, JPG, WEBP …).
    Returns extracted text as a string.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        logger.error("OCR failed on image: %s", e)
        raise RuntimeError(f"OCR failed: {e}")
 
 
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> list[str]:
    """
    Converts each PDF page to an image and runs OCR on it.
    Returns a list of strings — one entry per page.
 
    On Linux (EC2): poppler is installed via apt, no path needed.
    On Windows (dev): install poppler and add to PATH, or set POPPLER_PATH env var.
    """
    poppler_path = os.getenv("POPPLER_PATH")   # None on Linux → uses PATH
 
    try:
        pages = convert_from_bytes(pdf_bytes, dpi=200, poppler_path=poppler_path)
    except Exception as e:
        logger.error("PDF conversion failed: %s", e)
        raise RuntimeError(
            f"PDF → image conversion failed: {e}. "
            "Ensure poppler-utils is installed (Ubuntu: sudo apt install poppler-utils)."
        )
 
    page_texts: list[str] = []
    for i, page in enumerate(pages, start=1):
        try:
            text = pytesseract.image_to_string(page)
            page_texts.append(text.strip())
        except Exception as e:
            logger.warning("OCR failed on page %d: %s — skipping", i, e)
            page_texts.append("")
 
    return page_texts