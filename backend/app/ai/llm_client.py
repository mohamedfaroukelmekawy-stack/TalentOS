import logging
import cohere
from app.config import settings
from app.ai.embedder import get_cohere_client

logger = logging.getLogger(__name__)


async def generate_text(prompt: str, system_preamble: str = "", max_tokens: int = 1500) -> str:
    client = get_cohere_client()
    response = await client.chat(
        model=settings.COHERE_GENERATE_MODEL,
        message=prompt,
        preamble=system_preamble or "You are TalentOS AI, an expert in employee development and skills gap analysis.",
        max_tokens=max_tokens,
    )
    return response.text


async def generate_with_history(
    message: str,
    chat_history: list[dict],
    preamble: str = "",
    max_tokens: int = 1000,
) -> str:
    client = get_cohere_client()
    cohere_history = []
    for msg in chat_history:
        role = "USER" if msg["role"] == "user" else "CHATBOT"
        cohere_history.append({"role": role, "message": msg["content"]})

    response = await client.chat(
        model=settings.COHERE_GENERATE_MODEL,
        message=message,
        chat_history=cohere_history,
        preamble=preamble or "You are TalentOS AI, an expert in employee development and skills gap analysis.",
        max_tokens=max_tokens,
    )
    return response.text
