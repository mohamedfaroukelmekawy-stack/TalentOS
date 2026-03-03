import logging
from typing import Union
import cohere
from app.config import settings

logger = logging.getLogger(__name__)
_client: cohere.AsyncClient | None = None


def get_cohere_client() -> cohere.AsyncClient:
    global _client
    if _client is None:
        _client = cohere.AsyncClient(api_key=settings.COHERE_API_KEY)
    return _client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    client = get_cohere_client()
    response = await client.embed(
        texts=texts,
        model=settings.COHERE_EMBED_MODEL,
        input_type="search_document",
    )
    return response.embeddings


async def embed_query(query: str) -> list[float]:
    client = get_cohere_client()
    response = await client.embed(
        texts=[query],
        model=settings.COHERE_EMBED_MODEL,
        input_type="search_query",
    )
    return response.embeddings[0]
