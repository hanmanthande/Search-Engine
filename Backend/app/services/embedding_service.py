import logging
from functools import lru_cache
from sentence_transformers import SentenceTransformer
 
logger = logging.getLogger(__name__)
 
MODEL_NAME = "all-MiniLM-L6-v2"
 
 
@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    """
    Loads the embedding model once and caches it for the lifetime of the process.
    lru_cache(maxsize=1) guarantees a single instance even under concurrent startup.
    """
    logger.info("Loading embedding model: %s", MODEL_NAME)
    try:
        model = SentenceTransformer(MODEL_NAME)
        logger.info("Embedding model loaded successfully")
        return model
    except Exception as e:
        logger.critical("Failed to load embedding model '%s': %s", MODEL_NAME, e)
        raise RuntimeError(
            f"Could not load SentenceTransformer model '{MODEL_NAME}'. "
            "Ensure sentence-transformers is installed and the model can be downloaded."
        ) from e
 
 
def generate_embedding(text: str) -> list[float]:
    """
    Generates a 384-dimensional embedding vector for the given text.
    Returns a plain Python list (compatible with pgvector).
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")
 
    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()