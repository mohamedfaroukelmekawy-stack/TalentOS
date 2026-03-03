import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.assessment import Assessment
from app.models.skill import Skill, DepartmentSkill
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, SkillGap, EmployeeGapReport

logger = logging.getLogger(__name__)


async def _get_required_level(db: AsyncSession, employee_id: str, skill_id: str) -> float | None:
    user_res = await db.execute(select(User).where(User.id == employee_id))
    user = user_res.scalar_one_or_none()
    if not user or not user.department_id:
        return None

    ds_res = await db.execute(
        select(DepartmentSkill).where(
            DepartmentSkill.department_id == user.department_id,
            DepartmentSkill.skill_id == skill_id,
        )
    )
    ds = ds_res.scalar_one_or_none()
    return float(ds.required_level) if ds else None


async def upsert_assessment(db: AsyncSession, data: AssessmentCreate, assessor_id: str) -> Assessment:
    user_res = await db.execute(select(User).where(User.id == data.employee_id))
    if not user_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    skill_res = await db.execute(select(Skill).where(Skill.id == data.skill_id))
    if not skill_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    existing_res = await db.execute(
        select(Assessment).where(
            Assessment.employee_id == data.employee_id,
            Assessment.skill_id == data.skill_id,
        )
    )
    assessment = existing_res.scalar_one_or_none()

    required = await _get_required_level(db, data.employee_id, data.skill_id)
    gap = round(required - data.score, 2) if required is not None else None

    if assessment:
        assessment.score = data.score
        assessment.gap = gap
        assessment.notes = data.notes
        assessment.assessed_by = assessor_id
    else:
        assessment = Assessment(
            employee_id=data.employee_id,
            skill_id=data.skill_id,
            score=data.score,
            gap=gap,
            notes=data.notes,
            assessed_by=assessor_id,
        )
        db.add(assessment)

    await db.flush()
    await db.refresh(assessment)
    return assessment


async def get_employee_assessments(db: AsyncSession, employee_id: str) -> list[Assessment]:
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.skill))
        .where(Assessment.employee_id == employee_id)
    )
    return result.scalars().all()


async def calculate_gaps(db: AsyncSession, employee_id: str) -> EmployeeGapReport:
    user_res = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == employee_id)
    )
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    if not user.department_id:
        return EmployeeGapReport(
            employee_id=employee_id,
            employee_name=user.full_name,
            gaps=[],
            avg_gap=0.0,
            skills_at_level=0,
            skills_below_level=0,
        )

    dept_skills_res = await db.execute(
        select(DepartmentSkill)
        .options(selectinload(DepartmentSkill.skill))
        .where(DepartmentSkill.department_id == user.department_id)
    )
    dept_skills = dept_skills_res.scalars().all()

    assessments_res = await db.execute(
        select(Assessment).where(Assessment.employee_id == employee_id)
    )
    assessments = {a.skill_id: a for a in assessments_res.scalars().all()}

    gaps = []
    for ds in dept_skills:
        current_score = assessments[ds.skill_id].score if ds.skill_id in assessments else 0
        gap = float(ds.required_level) - float(current_score)
        gaps.append(SkillGap(
            skill_id=ds.skill_id,
            skill_name=ds.skill.name,
            current_score=current_score,
            required_level=ds.required_level,
            gap=round(gap, 2),
            category=ds.skill.category,
        ))

    skills_at = sum(1 for g in gaps if g.gap <= 0)
    skills_below = sum(1 for g in gaps if g.gap > 0)
    avg_gap = round(sum(g.gap for g in gaps) / len(gaps), 2) if gaps else 0.0

    return EmployeeGapReport(
        employee_id=employee_id,
        employee_name=user.full_name,
        department=user.department.name if user.department else None,
        gaps=gaps,
        avg_gap=avg_gap,
        skills_at_level=skills_at,
        skills_below_level=skills_below,
    )
