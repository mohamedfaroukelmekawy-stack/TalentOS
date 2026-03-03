import logging
import math
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.models.user import User, RoleEnum
from app.models.department import Department
from app.models.assessment import Assessment
from app.models.skill import DepartmentSkill, Skill
from app.auth.password import hash_password
from app.schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsers
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def create_employee(db: AsyncSession, data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if data.department_id:
        dept = await db.execute(select(Department).where(Department.id == data.department_id))
        if not dept.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=RoleEnum(data.role),
        department_id=data.department_id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def get_employee(db: AsyncSession, employee_id: str) -> User:
    result = await db.execute(
        select(User)
        .options(selectinload(User.department))
        .where(User.id == employee_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return user


async def list_employees(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    department_id: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
) -> PaginatedUsers:
    query = select(User).options(selectinload(User.department))
    count_query = select(func.count(User.id))

    if department_id:
        query = query.where(User.department_id == department_id)
        count_query = count_query.where(User.department_id == department_id)
    if role:
        query = query.where(User.role == RoleEnum(role))
        count_query = count_query.where(User.role == RoleEnum(role))
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))
        count_query = count_query.where(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()

    return PaginatedUsers(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


async def update_employee(db: AsyncSession, employee_id: str, data: UserUpdate) -> User:
    user = await get_employee(db, employee_id)
    update_data = data.model_dump(exclude_none=True)

    if "role" in update_data:
        update_data["role"] = RoleEnum(update_data["role"])
    if "department_id" in update_data and update_data["department_id"]:
        dept = await db.execute(select(Department).where(Department.id == update_data["department_id"]))
        if not dept.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


async def delete_employee(db: AsyncSession, employee_id: str) -> None:
    user = await get_employee(db, employee_id)
    user.is_active = False
    await db.flush()
