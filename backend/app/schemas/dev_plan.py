
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DevPlanResponse(BaseModel):
    id: str
    employee_id: str
    title: str
    content: str
    skills_targeted: list
    timeline_weeks: Optional[int] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    employee_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []


class GeneratePlanRequest(BaseModel):
    employee_id: str
    notes: Optional[str] = None


class CVParseRequest(BaseModel):
    employee_id: str
    filename: Optional[str] = None


class CVParseResponse(BaseModel):
    employee_id: str
    skills_extracted: list[str] = []
    raw_text: Optional[str] = None
    status: str = "parsed"