from fastapi import APIRouter
from app.api.v1.endpoints import forecasts, weights, advisories, pipeline, websockets

api_router = APIRouter()

api_router.include_router(forecasts.router, prefix="/forecasts", tags=["Forecasts"])
api_router.include_router(weights.router, prefix="/weights", tags=["Bayesian Weights & What-If"])
api_router.include_router(advisories.router, prefix="/advisories", tags=["Advisories & Alerts"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["Pipeline Telemetry"])
