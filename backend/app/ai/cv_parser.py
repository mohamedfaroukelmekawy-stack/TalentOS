import logging
import json
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.document import Document, DocumentChunk
from app.models.user import User
from app.ai.chunker import extract_and_chunk
from app.ai.embedder import embed_texts
from app.ai.vector_store import store_chunks
from app.ai.llm_client import generate_text
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def parse_and_store_cv(
    db: AsyncSession,
    employee_id: str,
    filename: str,
    file_bytes: bytes,
) -> dict:
    user_res = await db.execute(select(User).where(User.id == employee_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    doc = Document(employee_id=employee_id, filename=filename, doc_type="cv")
    db.add(doc)
    await db.flush()

    chunks = extract_and_chunk(filename, file_bytes)
    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not extract text from document")

    embeddings = await embed_texts(chunks)
    await store_chunks(db, doc.id, chunks, embeddings)

    full_text = " ".join(chunks[:10])
    prompt = f"""Analyze this CV excerpt and extract:
1. Key technical skills (list)
2. Years of experience
3. Education background
4. Notable achievements

CV Text:
{full_text[:3000]}

Respond in a structured format."""

    extracted = generate_text(prompt)

    return {
        "document_id": doc.id,
        "chunks_stored": len(chunks),
        "extracted_info": extracted,
    }


async def extract_skills_from_cv(db: AsyncSession, employee_id: str) -> list[str]:
    chunks_res = await db.execute(
        select(DocumentChunk)
        .join(Document)
        .where(Document.employee_id == employee_id)
        .order_by(DocumentChunk.chunk_index)
        .limit(10)
    )
    chunks = chunks_res.scalars().all()
    if not chunks:
        return []

    text = " ".join(c.content for c in chunks)
    prompt = f"""Extract only a list of technical and professional skills from this CV.
Return as a JSON array of strings. Example: ["Python", "Machine Learning", "SQL"]

CV: {text[:2000]}

Skills JSON array:"""

    result = generate_text(prompt)

    match = re.search(r'\[.*?\]', result, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return []