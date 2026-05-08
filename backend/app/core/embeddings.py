import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from sentence_transformers import SentenceTransformer
from functools import lru_cache
from app.config import settings
from loguru import logger

@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
    return SentenceTransformer(settings.EMBEDDING_MODEL, device='cpu')

def embed_text(text: str) -> list[float]:
    return get_embedder().encode(text, normalize_embeddings=True).tolist()

def embed_batch(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    return get_embedder().encode(
        texts, normalize_embeddings=True, batch_size=batch_size
    ).tolist()
from typing import Optional
from loguru import logger
from sentence_transformers import SentenceTransformer
from app.config import settings

_model: Optional[SentenceTransformer] = None


def load_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        _model = SentenceTransformer(settings.embedding_model)
        logger.info("Embedding model loaded successfully.")
    return _model


def get_model() -> SentenceTransformer:
    if _model is None:
        raise RuntimeError("Embedding model not loaded. Call load_model() during app startup.")
    return _model


def embed_text(text: str) -> list[float]:
    return get_model().encode(text, normalize_embeddings=True).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    return get_model().encode(texts, normalize_embeddings=True).tolist()
