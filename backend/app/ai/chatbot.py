import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embedder import embed_query
from app.ai.vector_store import similarity_search_chunks
from app.ai.llm_client import generate_with_history
from app.schemas.dev_plan import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

PREAMBLE = """You are TalentOS AI Assistant — an expert in employee development, career growth, and skills training.
You have access to the employee's CV/documents context below. Use it to give personalized, actionable advice.
Be concise, professional, and encouraging. If you don't know something, say so."""


async def chat(db: AsyncSession, request: ChatRequest, employee_id: str) -> ChatResponse:
    query_emb = await embed_query(request.message)

    sources = []
    context_text = ""
    if employee_id:
        similar_chunks = await similarity_search_chunks(db, query_emb, employee_id, top_k=4)
        if similar_chunks:
            context_text = "\n\n".join(c.content for c in similar_chunks[:3])
            sources = [f"Document chunk {c.chunk_index}" for c in similar_chunks[:3]]

    message_with_context = request.message
    if context_text:
        message_with_context = (
            f"Context from employee's documents:\n{context_text[:2000]}\n\n"
            f"Employee question: {request.message}"
        )

    history = [{"role": m.role, "content": m.content} for m in request.history]
    reply = await generate_with_history(
        message=message_with_context,
        chat_history=history,
        preamble=PREAMBLE,
        max_tokens=800,
    )

    return ChatResponse(reply=reply, sources=sources)
