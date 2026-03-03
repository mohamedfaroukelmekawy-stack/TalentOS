import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk
from app.models.skill import Skill

logger = logging.getLogger(__name__)


async def store_chunks(
    db: AsyncSession,
    document_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
) -> list[DocumentChunk]:
    stored = []
    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        dc = DocumentChunk(
            document_id=document_id,
            chunk_index=idx,
            content=chunk,
            embedding=embedding,
        )
        db.add(dc)
        stored.append(dc)
    await db.flush()
    return stored


async def similarity_search_chunks(
    db: AsyncSession,
    query_embedding: list[float],
    employee_id: str,
    top_k: int = 5,
) -> list[DocumentChunk]:
    vec_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
    stmt = text("""
        SELECT dc.id
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.employee_id = :employee_id
          AND dc.embedding IS NOT NULL
        ORDER BY dc.embedding <=> CAST(:vec AS vector)
        LIMIT :top_k
    """)
    result = await db.execute(stmt, {"employee_id": employee_id, "vec": vec_str, "top_k": top_k})
    ids = [row[0] for row in result.fetchall()]

    if not ids:
        return []

    chunks_res = await db.execute(
        select(DocumentChunk).where(DocumentChunk.id.in_(ids))
    )
    return chunks_res.scalars().all()


async def similarity_search_skills(
    db: AsyncSession,
    query_embedding: list[float],
    top_k: int = 5,
) -> list[Skill]:
    vec_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
    stmt = text("""
        SELECT id
        FROM skills
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:vec AS vector)
        LIMIT :top_k
    """)
    result = await db.execute(stmt, {"vec": vec_str, "top_k": top_k})
    ids = [row[0] for row in result.fetchall()]

    if not ids:
        return []

    skills_res = await db.execute(select(Skill).where(Skill.id.in_(ids)))
    return skills_res.scalars().all()
