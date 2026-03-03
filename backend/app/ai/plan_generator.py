import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.dev_plan import DevPlan
from app.ai.embedder import embed_query
from app.ai.vector_store import similarity_search_chunks
from app.ai.llm_client import generate_text
from app.services.assessment_service import calculate_gaps
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def generate_development_plan(db: AsyncSession, employee_id: str) -> DevPlan:
    user_res = await db.execute(select(User).where(User.id == employee_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    gap_report = await calculate_gaps(db, employee_id)

    top_gaps = sorted(gap_report.gaps, key=lambda g: g.gap, reverse=True)[:5]
    gaps_text = "\n".join(
        f"- {g.skill_name}: current {g.current_score}/5, required {g.required_level}/5 (gap: {g.gap})"
        for g in top_gaps
    )

    query_str = " ".join(g.skill_name for g in top_gaps)
    if query_str:
        query_emb = await embed_query(query_str)
        similar_chunks = await similarity_search_chunks(db, query_emb, employee_id, top_k=5)
        cv_context = "\n".join(c.content for c in similar_chunks)
    else:
        cv_context = "No CV uploaded yet."

    prompt = f"""You are an expert L&D (Learning & Development) specialist.

Employee: {user.full_name}
Department: {gap_report.department or "Unassigned"}

Top Skill Gaps:
{gaps_text if gaps_text else "No gaps identified"}

CV/Background Context:
{cv_context[:2000]}

Generate a comprehensive, personalized 12-week development plan that:
1. Prioritizes the biggest skill gaps
2. Includes specific courses, certifications, and resources
3. Sets weekly milestones
4. Leverages existing strengths
5. Is actionable and realistic

Format the plan with clear sections: Executive Summary, Weekly Schedule, Resources, Success Metrics."""

    content = await generate_text(prompt, max_tokens=2000)
    skills_targeted = [g.skill_name for g in top_gaps]

    existing_res = await db.execute(
        select(DevPlan).where(DevPlan.employee_id == employee_id, DevPlan.is_active == True)
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        existing.is_active = False

    plan = DevPlan(
        employee_id=employee_id,
        title=f"Development Plan for {user.full_name} - Q{_current_quarter()}",
        content=content,
        skills_targeted=skills_targeted,
        timeline_weeks=12,
        is_active=True,
    )
    db.add(plan)
    await db.flush()
    await db.refresh(plan)
    return plan


def _current_quarter() -> int:
    from datetime import datetime
    return (datetime.now().month - 1) // 3 + 1
