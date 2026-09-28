import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "ForecastFusion Backend API"
    VERSION: str = "2.6.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    DATABASE_URL: str = "sqlite+aiosqlite:///./forecastfusion.db"

    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    CACHE_TTL_SECONDS: int = 300
    PIPELINE_CYCLE_SECONDS: int = 30

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
