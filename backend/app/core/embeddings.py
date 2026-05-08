import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

# Limit PyTorch threads before any torch/sentence_transformers import
import torch
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

from functools import lru_cache
from loguru import logger
from sentence_transformers import SentenceTransformer
from app.config import settings


@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
    model = SentenceTransformer(settings.EMBEDDING_MODEL, device="cpu")
    logger.info("Embedding model ready.")
    return model


def embed_text(text: str) -> list[float]:
    return get_embedder().encode(text, normalize_embeddings=True).tolist()


def embed_batch(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    return get_embedder().encode(
        texts, normalize_embeddings=True, batch_size=batch_size
    ).tolist()
