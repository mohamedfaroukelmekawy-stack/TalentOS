from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, EmployeeGapReport
from app.services import assessment_service

router = APIRouter()


@router.post("", response_model=AssessmentResponse, status_code=201)
async def submit_assessment(
    data: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
):
    return await assessment_service.upsert_assessment(db, data, current_user.id)


@router.get("/employee/{employee_id}", response_model=list[AssessmentResponse])
async def get_employee_assessments(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await assessment_service.get_employee_assessments(db, employee_id)


@router.get("/gaps/{employee_id}", response_model=EmployeeGapReport)
async def get_employee_gaps(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await assessment_service.calculate_gaps(db, employee_id)
