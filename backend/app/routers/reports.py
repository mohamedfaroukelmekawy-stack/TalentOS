from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User
from app.services import report_service

router = APIRouter()


@router.get("/employee/{employee_id}")
async def employee_report(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, Any]:
    return await report_service.get_employee_report(db, employee_id)


@router.get("/department/{department_id}")
async def department_report(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin", "manager")),
) -> dict[str, Any]:
    return await report_service.get_department_report(db, department_id)


@router.get("/company")
async def company_summary(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> dict[str, Any]:
    return await report_service.get_company_summary(db)
