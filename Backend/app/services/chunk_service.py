import re
import logging
from app.config import CHUNK_SIZE, CHUNK_OVERLAP
 
logger = logging.getLogger(__name__)
 
# Sentence boundary pattern — splits on . ! ? followed by whitespace / end of string
_SENTENCE_END = re.compile(r'(?<=[.!?])\s+')
 
 
def _split_into_sentences(text: str) -> list[str]:
    """Splits text into sentences using punctuation boundaries."""
    sentences = _SENTENCE_END.split(text.strip())
    return [s.strip() for s in sentences if s.strip()]
 
 
def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Splits text into overlapping chunks that respect sentence boundaries.
 
    Strategy:
    1. Split text into sentences.
    2. Accumulate sentences until the chunk reaches `chunk_size` characters.
    3. Start the next chunk `overlap` characters back (carry-over sentences).
 
    This avoids cutting words or sentences mid-way, which degrades RAG quality.
    Falls back to character slicing only if a single sentence exceeds chunk_size.
    """
    if not text or not text.strip():
        return []
 
    sentences = _split_into_sentences(text)
    if not sentences:
        return []
 
    chunks: list[str] = []
    current_sentences: list[str] = []
    current_length = 0
 
    for sentence in sentences:
        sentence_len = len(sentence)
 
        # If a single sentence is longer than chunk_size, force-split it by characters
        if sentence_len > chunk_size:
            # Flush whatever we have first
            if current_sentences:
                chunks.append(" ".join(current_sentences))
                current_sentences = []
                current_length = 0
 
            for i in range(0, sentence_len, chunk_size - overlap):
                chunks.append(sentence[i : i + chunk_size])
            continue
 
        # Adding this sentence would exceed the limit → flush current chunk
        if current_length + sentence_len > chunk_size and current_sentences:
            chunks.append(" ".join(current_sentences))
 
            # Carry over sentences to create overlap
            overlap_sentences: list[str] = []
            overlap_len = 0
            for s in reversed(current_sentences):
                if overlap_len + len(s) <= overlap:
                    overlap_sentences.insert(0, s)
                    overlap_len += len(s)
                else:
                    break
 
            current_sentences = overlap_sentences
            current_length = overlap_len
 
        current_sentences.append(sentence)
        current_length += sentence_len
 
    # Flush the final chunk
    if current_sentences:
        chunks.append(" ".join(current_sentences))
 
    logger.debug("split_text → %d chunks from %d chars", len(chunks), len(text))
    return chunks