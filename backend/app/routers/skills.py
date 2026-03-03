from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillResponse, DepartmentSkillCreate, DepartmentSkillResponse
from app.services import skill_service

router = APIRouter()


@router.get("", response_model=list[SkillResponse])
async def list_skills(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await skill_service.list_skills(db, category)


@router.post("", response_model=SkillResponse, status_code=201)
async def create_skill(
    data: SkillCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return await skill_service.create_skill(db, data)


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await skill_service.get_skill(db, skill_id)


@router.get("/department/{department_id}", response_model=list[DepartmentSkillResponse])
async def get_department_skills(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await skill_service.get_department_skills(db, department_id)


@router.post("/department/{department_id}", response_model=DepartmentSkillResponse, status_code=201)
async def assign_skill_to_department(
    department_id: str,
    data: DepartmentSkillCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    return await skill_service.assign_skill_to_department(db, department_id, data)


@router.delete("/department/{department_id}/{skill_id}", status_code=204)
async def remove_skill_from_department(
    department_id: str,
    skill_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    await skill_service.remove_skill_from_department(db, department_id, skill_id)
