from pydantic import BaseModel
from typing import Optional


class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class SkillResponse(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class DepartmentSkillCreate(BaseModel):
    skill_id: str
    required_level: Optional[int] = None


class DepartmentSkillResponse(BaseModel):
    id: str
    department_id: str
    skill_id: str
    required_level: Optional[int] = None
    skill: Optional[SkillResponse] = None

    model_config = {"from_attributes": True}


class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}
