
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class DepartmentSummary(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    department_id: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department_id: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    department: Optional[DepartmentSummary] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedUsers(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int
    pages: int


# Alias — both names work, same class
UserListResponse = PaginatedUsers