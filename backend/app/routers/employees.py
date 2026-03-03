from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsers
from app.services import employee_service

router = APIRouter()


@router.get("", response_model=PaginatedUsers)
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department_id: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await employee_service.list_employees(db, page, page_size, department_id, role, search)


@router.post("", response_model=UserResponse, status_code=201)
async def create_employee(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    return await employee_service.create_employee(db, data)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await employee_service.get_employee(db, current_user.id)


@router.get("/{employee_id}", response_model=UserResponse)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await employee_service.get_employee(db, employee_id)


@router.put("/{employee_id}", response_model=UserResponse)
async def update_employee(
    employee_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
):
    return await employee_service.update_employee(db, employee_id, data)


@router.delete("/{employee_id}", status_code=204)
async def deactivate_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    await employee_service.delete_employee(db, employee_id)
