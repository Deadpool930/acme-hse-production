from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from .database import engine, Base, get_db
import asyncio
from .services import audit, escalation
from contextlib import asynccontextmanager
from .api import events, master, auth, users, dashboard

from starlette.middleware.base import BaseHTTPMiddleware
import asyncio
from typing import Callable

class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, timeout: int = 10):
        super().__init__(app)
        self.timeout = timeout

    async def dispatch(self, request, call_next):
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout)
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="System Monitoring: Gateway Timeout (SLA Breach)")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Senior Developer Choice: Re-enable engine now that port stability is confirmed
    try:
        task = asyncio.create_task(escalation.run_escalation_engine())
    except Exception as e:
        print(f"Warning: Could not start escalation engine: {e}")
        task = None
    yield
    if task:
        task.cancel()

app = FastAPI(
    title="ACME Solar HSE Management System",
    description="Full-stack EHS Reporting & Analytics Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Senior Developer Choice: Request Timeout Guard
app.add_middleware(RequestTimeoutMiddleware, timeout=10)

# Senior Developer Choice: Explicit CORS for All Dev Ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173", "http://localhost:5173",
        "http://127.0.0.1:5174", "http://localhost:5174",
        "http://127.0.0.1:5175", "http://localhost:5175",
        "http://127.0.0.1:5176", "http://localhost:5176"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root entry point for API discovery"""
    return {
        "message": "ACME Solar HSE API is operational",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/v1")
@app.get("/api/v1/")
async def api_root():
    """API-level heartbeat for frontend status checks"""
    return {"status": "operational", "v1": True}

@app.get("/api/v1/health")
@app.get("/health")
async def health_check():
    """System health monitor"""
    return {"status": "healthy", "service": "acme-hse-api"}

# Include Routers
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(master.router, prefix="/api/v1/master", tags=["Master Data"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
