from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AssessmentCreate(BaseModel):
    employee_id: str
    skill_id: str
    score: int = Field(ge=1, le=5)
    notes: Optional[str] = None


class AssessmentUpdate(BaseModel):
    score: Optional[int] = Field(default=None, ge=1, le=5)
    notes: Optional[str] = None


class AssessmentResponse(BaseModel):
    id: str
    employee_id: str
    skill_id: str
    score: int
    gap: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SkillGap(BaseModel):
    skill_id: str
    skill_name: str
    current_score: int
    required_level: int
    gap: float
    category: Optional[str] = None


class EmployeeGapReport(BaseModel):
    employee_id: str
    employee_name: str
    department: Optional[str] = None
    gaps: list[SkillGap]
    avg_gap: float
    skills_at_level: int
    skills_below_level: int


GapAnalysisResponse = EmployeeGapReport
