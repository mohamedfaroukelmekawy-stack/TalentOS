from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DepartmentSkillCreate(BaseModel):
    skill_id: str
    required_level: int = 3


class DepartmentSkillResponse(BaseModel):
    id: str
    department_id: str
    skill_id: str
    required_level: int
    skill: SkillResponse

    model_config = {"from_attributes": True}
