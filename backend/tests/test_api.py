import pytest
from httpx import AsyncClient
from app.main import app
from app.database import Base, engine, AsyncSessionLocal

@pytest.fixture(scope="module")
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_dashboard_summary(client):
    """Verify the dashboard analytic aggregator."""
    response = await client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "trends" in data

@pytest.mark.asyncio
async def test_pbi_reports(client):
    """Verify the Power BI export endpoint."""
    response = await client.get("/api/v1/dashboard/pbi/reports")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_master_plants(client):
    """Verify master data retrieval."""
    response = await client.get("/api/v1/master/plants")
    assert response.status_code == 200
