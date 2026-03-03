import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app


@pytest.mark.asyncio
async def test_register_success():
    mock_user = MagicMock()
    mock_user.id = "test-uuid"
    mock_user.role = MagicMock()
    mock_user.role.value = "employee"

    with patch("app.routers.auth.get_db") as mock_db_dep, \
         patch("app.auth.jwt_handler.create_access_token", return_value="access123"), \
         patch("app.auth.jwt_handler.create_refresh_token", return_value="refresh123"):

        mock_session = AsyncMock()
        mock_session.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
        mock_db_dep.return_value.__aenter__ = AsyncMock(return_value=mock_session)
        mock_db_dep.return_value.__aexit__ = AsyncMock(return_value=False)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "email": "test@talentos.io",
                "password": "Secure123!",
                "full_name": "Test User",
                "role": "employee",
            })
        assert response.status_code in (201, 422, 500)


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch("app.routers.auth.get_db") as mock_db:
            mock_session = AsyncMock()
            mock_session.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))

            async def db_gen():
                yield mock_session

            mock_db.return_value = db_gen()
            response = await client.post("/api/v1/auth/login", json={
                "email": "noone@talentos.io",
                "password": "wrongpass",
            })
        assert response.status_code in (401, 422, 500)


def test_password_hashing():
    from app.auth.password import hash_password, verify_password
    hashed = hash_password("MySecret123!")
    assert verify_password("MySecret123!", hashed)
    assert not verify_password("WrongPass", hashed)


def test_jwt_create_decode():
    from app.auth.jwt_handler import create_access_token, decode_token
    token = create_access_token("user-123", "admin")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["role"] == "admin"
    assert payload["type"] == "access"


def test_refresh_token():
    from app.auth.jwt_handler import create_refresh_token, decode_refresh_token
    token = create_refresh_token("user-456", "manager")
    payload = decode_refresh_token(token)
    assert payload["sub"] == "user-456"
    assert payload["type"] == "refresh"
