import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.schemas.assessment import AssessmentCreate, SkillGap, EmployeeGapReport


def test_gap_calculation_logic():
    gap = SkillGap(
        skill_id="s1", skill_name="Python", current_score=3, required_level=5, gap=2.0
    )
    assert gap.gap == 2.0
    assert gap.current_score == 3


def test_employee_gap_report_structure():
    report = EmployeeGapReport(
        employee_id="e1",
        employee_name="Alice",
        department="Engineering",
        gaps=[
            SkillGap(skill_id="s1", skill_name="Python", current_score=4, required_level=5, gap=1.0),
            SkillGap(skill_id="s2", skill_name="SQL", current_score=5, required_level=5, gap=0.0),
        ],
        avg_gap=0.5,
        skills_at_level=1,
        skills_below_level=1,
    )
    assert len(report.gaps) == 2
    assert report.avg_gap == 0.5
    assert report.skills_below_level == 1


def test_assessment_create_validation():
    a = AssessmentCreate(employee_id="e1", skill_id="s1", score=3)
    assert a.score == 3

    with pytest.raises(Exception):
        AssessmentCreate(employee_id="e1", skill_id="s1", score=6)

    with pytest.raises(Exception):
        AssessmentCreate(employee_id="e1", skill_id="s1", score=0)
