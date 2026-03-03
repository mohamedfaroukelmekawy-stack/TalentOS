import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.mark.asyncio
async def test_company_summary_structure():
    from app.services.report_service import get_company_summary

    mock_db = AsyncMock()
    scalar_mock = MagicMock(return_value=5)
    mock_result = MagicMock()
    mock_result.scalar_one = MagicMock(return_value=5)
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_result)

    result = await get_company_summary(mock_db)
    assert "kpis" in result
    assert "departments" in result


@pytest.mark.asyncio
async def test_employee_report_empty():
    from app.services.report_service import get_employee_report
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_result.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=mock_result)

    result = await get_employee_report(mock_db, "nonexistent")
    assert result == {}
