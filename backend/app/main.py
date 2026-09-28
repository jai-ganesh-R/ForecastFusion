from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.region import RegionModel, INITIAL_REGIONS
from app.api.v1.router import api_router
from app.api.v1.endpoints import websockets

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed regions if needed
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RegionModel))
        existing = result.scalars().first()
        if not existing:
            for r_data in INITIAL_REGIONS:
                reg = RegionModel(**r_data)
                session.add(reg)
            await session.commit()

    yield
    # Shutdown: Clean up connections
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Meteorological Multi-Model Ensemble Intelligence Platform — Backend API (SIH26081 MoES Track)",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include WebSockets
app.include_router(websockets.router, prefix="/ws/v1", tags=["WebSockets"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to ForecastFusion Backend API",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }
