import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.database import Base
from app.config import settings


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.VECTOR_DIMENSION), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    dept_skills: Mapped[list["DepartmentSkill"]] = relationship("DepartmentSkill", back_populates="skill")
    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="skill")


class DepartmentSkill(Base):
    __tablename__ = "department_skills"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_level: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1–5 scale

    department: Mapped["Department"] = relationship("Department", back_populates="dept_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="dept_skills")
