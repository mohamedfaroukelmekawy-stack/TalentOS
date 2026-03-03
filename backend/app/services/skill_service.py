import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.skill import Skill, DepartmentSkill
from app.models.department import Department
from app.schemas.skill import SkillCreate, DepartmentSkillCreate, SkillResponse, DepartmentSkillResponse

logger = logging.getLogger(__name__)


async def create_skill(db: AsyncSession, data: SkillCreate) -> Skill:
    existing = await db.execute(select(Skill).where(Skill.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already exists")

    skill = Skill(name=data.name, description=data.description, category=data.category)
    db.add(skill)
    await db.flush()
    await db.refresh(skill)
    return skill


async def list_skills(db: AsyncSession, category: str | None = None) -> list[Skill]:
    query = select(Skill).order_by(Skill.name)
    if category:
        query = query.where(Skill.category == category)
    result = await db.execute(query)
    return result.scalars().all()


async def get_skill(db: AsyncSession, skill_id: str) -> Skill:
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


async def assign_skill_to_department(
    db: AsyncSession, department_id: str, data: DepartmentSkillCreate
) -> DepartmentSkill:
    dept = await db.execute(select(Department).where(Department.id == department_id))
    if not dept.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    skill = await get_skill(db, data.skill_id)

    existing = await db.execute(
        select(DepartmentSkill).where(
            DepartmentSkill.department_id == department_id,
            DepartmentSkill.skill_id == data.skill_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already assigned to department")

    ds = DepartmentSkill(
        department_id=department_id,
        skill_id=data.skill_id,
        required_level=data.required_level,
    )
    db.add(ds)
    await db.flush()
    await db.refresh(ds)
    return ds


async def get_department_skills(db: AsyncSession, department_id: str) -> list[DepartmentSkill]:
    result = await db.execute(
        select(DepartmentSkill)
        .options(selectinload(DepartmentSkill.skill))
        .where(DepartmentSkill.department_id == department_id)
    )
    return result.scalars().all()


async def remove_skill_from_department(db: AsyncSession, department_id: str, skill_id: str) -> None:
    result = await db.execute(
        select(DepartmentSkill).where(
            DepartmentSkill.department_id == department_id,
            DepartmentSkill.skill_id == skill_id,
        )
    )
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mapping not found")
    await db.delete(ds)
    await db.flush()
