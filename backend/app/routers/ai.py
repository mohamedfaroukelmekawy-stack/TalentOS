import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.dev_plan import DevPlanResponse, ChatRequest, ChatResponse
from app.ai import cv_parser, plan_generator, chatbot

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"application/pdf", "text/plain"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/cv/parse/{employee_id}")
async def parse_cv(
    employee_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and TXT files are accepted")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 10MB)")

    result = await cv_parser.parse_and_store_cv(db, employee_id, file.filename or "cv.pdf", contents)
    return result


@router.post("/plan/{employee_id}", response_model=DevPlanResponse)
async def generate_plan(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    plan = await plan_generator.generate_development_plan(db, employee_id)
    return DevPlanResponse.model_validate(plan)


@router.get("/plan/{employee_id}", response_model=list[DevPlanResponse])
async def get_plans(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.dev_plan import DevPlan
    result = await db.execute(
        select(DevPlan).where(DevPlan.employee_id == employee_id).order_by(DevPlan.created_at.desc())
    )
    plans = result.scalars().all()
    return [DevPlanResponse.model_validate(p) for p in plans]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee_id = request.employee_id or current_user.id
    return await chatbot.chat(db, request, employee_id)
