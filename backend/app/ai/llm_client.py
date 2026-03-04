
import logging
import cohere
from app.config import settings

logger = logging.getLogger(__name__)

_sync_client: cohere.Client | None = None


def get_sync_client() -> cohere.Client:
    global _sync_client
    if _sync_client is None:
        _sync_client = cohere.Client(api_key=settings.COHERE_API_KEY)
    return _sync_client


def generate_text(prompt: str, system_preamble: str = "", max_tokens: int = 1500) -> str:
    client = get_sync_client()
    response = client.chat(
        model=settings.COHERE_GENERATE_MODEL,
        message=prompt,
        preamble=system_preamble or "You are TalentOS AI, an expert in employee development and skills gap analysis.",
        max_tokens=max_tokens,
    )
    return response.text


def generate_with_history(
    message: str,
    chat_history: list[dict],
    preamble: str = "",
    max_tokens: int = 1000,
) -> str:
    client = get_sync_client()
    cohere_history = []
    for msg in chat_history:
        role = "USER" if msg["role"] == "user" else "CHATBOT"
        cohere_history.append({"role": role, "message": msg["content"]})

    response = client.chat(
        model=settings.COHERE_GENERATE_MODEL,
        message=message,
        chat_history=cohere_history,
        preamble=preamble or "You are TalentOS AI, an expert in employee development and skills gap analysis.",
        max_tokens=max_tokens,
    )
    return response.text