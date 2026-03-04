
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsers
from app.schemas.skill import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services import employee_service

router = APIRouter()
dept_router = APIRouter()


# ─── Employee endpoints ───────────────────────────────────────────────────────

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


# ─── Department endpoints ─────────────────────────────────────────────────────

@dept_router.get("", response_model=list[DepartmentResponse])
async def list_departments(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await employee_service.list_departments(db)


@dept_router.post("", response_model=DepartmentResponse, status_code=201)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return await employee_service.create_department(db, data)


@dept_router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await employee_service.get_department(db, department_id)


@dept_router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: str,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return await employee_service.update_department(db, department_id, data)


@dept_router.delete("/{department_id}", status_code=204)
async def delete_department(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    await employee_service.delete_department(db, department_id)