import logging
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.user import User, RoleEnum
from app.models.department import Department
from app.models.assessment import Assessment
from app.models.skill import DepartmentSkill
from app.services.assessment_service import calculate_gaps

logger = logging.getLogger(__name__)


async def get_employee_report(db: AsyncSession, employee_id: str) -> dict[str, Any]:
    user_res = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == employee_id)
    )
    user = user_res.scalar_one_or_none()
    if not user:
        return {}

    assessments_res = await db.execute(
        select(Assessment).options(selectinload(Assessment.skill)).where(Assessment.employee_id == employee_id)
    )
    assessments = assessments_res.scalars().all()
    gap_report = await calculate_gaps(db, employee_id)

    return {
        "employee": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "department": user.department.name if user.department else None,
        },
        "skill_summary": {
            "total_assessed": len(assessments),
            "avg_score": round(sum(a.score for a in assessments) / len(assessments), 2) if assessments else 0,
            "skills_at_level": gap_report.skills_at_level,
            "skills_below_level": gap_report.skills_below_level,
            "avg_gap": gap_report.avg_gap,
        },
        "skill_details": [
            {
                "skill": a.skill.name,
                "score": a.score,
                "category": a.skill.category,
                "gap": a.gap,
            }
            for a in assessments
        ],
        "gaps": [g.model_dump() for g in gap_report.gaps],
    }


async def get_department_report(db: AsyncSession, department_id: str) -> dict[str, Any]:
    dept_res = await db.execute(select(Department).where(Department.id == department_id))
    dept = dept_res.scalar_one_or_none()
    if not dept:
        return {}

    employees_res = await db.execute(
        select(User).where(User.department_id == department_id, User.is_active == True)
    )
    employees = employees_res.scalars().all()

    dept_skills_res = await db.execute(
        select(DepartmentSkill).options(selectinload(DepartmentSkill.skill)).where(DepartmentSkill.department_id == department_id)
    )
    dept_skills = dept_skills_res.scalars().all()

    assessments_res = await db.execute(
        select(Assessment).where(Assessment.employee_id.in_([e.id for e in employees]))
    )
    assessments = assessments_res.scalars().all()

    total_gaps = [a.gap for a in assessments if a.gap is not None and a.gap > 0]
    avg_gap = round(sum(total_gaps) / len(total_gaps), 2) if total_gaps else 0.0

    skill_breakdown: dict[str, list[int]] = {}
    for a in assessments:
        skill_breakdown.setdefault(a.skill_id, []).append(a.score)

    return {
        "department": {"id": dept.id, "name": dept.name},
        "headcount": len(employees),
        "required_skills": len(dept_skills),
        "avg_gap": avg_gap,
        "skill_averages": [
            {
                "skill_id": sid,
                "avg_score": round(sum(scores) / len(scores), 2),
                "employees_assessed": len(scores),
            }
            for sid, scores in skill_breakdown.items()
        ],
    }


async def get_company_summary(db: AsyncSession) -> dict[str, Any]:
    total_employees = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    total_depts = await db.execute(select(func.count(Department.id)))
    total_assessments = await db.execute(select(func.count(Assessment.id)))

    avg_gap_res = await db.execute(
        select(func.avg(Assessment.gap)).where(Assessment.gap != None)
    )

    depts_res = await db.execute(select(Department))
    departments = depts_res.scalars().all()

    dept_data = []
    for dept in departments:
        emp_count_res = await db.execute(
            select(func.count(User.id)).where(User.department_id == dept.id, User.is_active == True)
        )
        dept_data.append({"id": dept.id, "name": dept.name, "headcount": emp_count_res.scalar_one()})

    return {
        "kpis": {
            "total_employees": total_employees.scalar_one(),
            "total_departments": total_depts.scalar_one(),
            "total_assessments": total_assessments.scalar_one(),
            "avg_skill_gap": round(float(avg_gap_res.scalar_one() or 0), 2),
        },
        "departments": dept_data,
    }
