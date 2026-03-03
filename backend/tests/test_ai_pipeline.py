import pytest
from unittest.mock import AsyncMock, patch


def test_chunker_splits_text():
    from app.ai.chunker import chunk_text
    text = " ".join([f"word{i}" for i in range(1200)])
    chunks = chunk_text(text, chunk_size=500, overlap=100)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c) > 0


def test_chunker_filters_short():
    from app.ai.chunker import chunk_text
    short_text = "Hello world"
    chunks = chunk_text(short_text, chunk_size=500, overlap=100)
    assert len(chunks) == 0


@pytest.mark.asyncio
async def test_embed_texts_called_with_cohere():
    with patch("app.ai.embedder.get_cohere_client") as mock_client_factory:
        mock_client = AsyncMock()
        mock_response = AsyncMock()
        mock_response.embeddings = [[0.1] * 1024, [0.2] * 1024]
        mock_client.embed = AsyncMock(return_value=mock_response)
        mock_client_factory.return_value = mock_client

        from app.ai.embedder import embed_texts
        result = await embed_texts(["hello", "world"])
        assert len(result) == 2
        assert len(result[0]) == 1024


def test_extract_text_from_pdf_handles_empty():
    from app.ai.chunker import chunk_text
    result = chunk_text("", chunk_size=500, overlap=100)
    assert result == []
