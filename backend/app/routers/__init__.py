from app.routers.employees import router as employees_router, dept_router
from app.routers.skills import router as skills_router, matrix_router


# Re-export for inclusion
from app.routers import auth, employees, skills, assessments, reports, ai

__all__ = ["auth", "employees", "skills", "assessments", "reports", "ai"]
