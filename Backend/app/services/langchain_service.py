import logging
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY, GROQ_MODEL
 
logger = logging.getLogger(__name__)
 
# ── LLM client ────────────────────────────────────────────────────────────────
# Instantiated once at module load; thread-safe for concurrent requests.
try:
    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=0.2,        # low temp → more factual, less hallucination
        max_tokens=1024,
    )
    logger.info("Groq LLM initialised with model: %s", GROQ_MODEL)
except Exception as e:
    logger.critical("Failed to initialise Groq LLM: %s", e)
    raise RuntimeError(
        "Groq LLM could not be initialised. "
        "Check GROQ_API_KEY and GROQ_MODEL in your .env file."
    ) from e
 
# ── Prompt template ───────────────────────────────────────────────────────────
_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are a helpful document assistant. Answer the user's question using ONLY the context provided below.
If the context does not contain enough information to answer the question, say "I could not find relevant information in the uploaded documents."
Do NOT make up information or use outside knowledge.
 
Context:
{context}
 
Question:
{question}
 
Answer:""",
)
 
 
def generate_rag_answer(question: str, context_chunks: list[str]) -> str:
    """
    Generates an answer to `question` grounded in `context_chunks`.
    Returns the LLM's response as a plain string.
    Raises RuntimeError if the LLM call fails.
    """
    if not context_chunks:
        return "No relevant document content was found to answer your question."
 
    context = "\n\n".join(context_chunks)
 
    formatted_prompt = _PROMPT.format(context=context, question=question)
 
    try:
        response = llm.invoke(formatted_prompt)
        return response.content.strip()
    except Exception as e:
        logger.error("Groq LLM call failed: %s", e)
        raise RuntimeError(f"LLM answer generation failed: {e}") from e

