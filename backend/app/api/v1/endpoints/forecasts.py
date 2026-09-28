from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.region import INITIAL_REGIONS
from app.schemas.forecast import RegionForecastResponse, DailyForecastItem
from app.services.ingestion.openmeteo_client import fetch_openmeteo_forecast
from app.services.blending.bayesian import blend_daily_forecast

router = APIRouter()

DEFAULT_WEIGHTS = {
    "delhi-ncr": {"ecmwf": 45, "gfs": 25, "ncum": 20, "openmeteo": 10},
    "mumbai-konkan": {"ecmwf": 22, "gfs": 48, "ncum": 20, "openmeteo": 10},
    "chennai-coromandel": {"ecmwf": 28, "gfs": 22, "ncum": 40, "openmeteo": 10},
    "kolkata-delta": {"ecmwf": 42, "gfs": 20, "ncum": 25, "openmeteo": 13},
    "bengaluru-plateau": {"ecmwf": 30, "gfs": 20, "ncum": 18, "openmeteo": 32},
    "hyderabad-telangana": {"ecmwf": 35, "gfs": 35, "ncum": 20, "openmeteo": 10},
    "jaipur-thar": {"ecmwf": 52, "gfs": 26, "ncum": 14, "openmeteo": 8},
    "guwahati-brahmaputra": {"ecmwf": 24, "gfs": 20, "ncum": 46, "openmeteo": 10},
    "bhopal-malwa": {"ecmwf": 36, "gfs": 34, "ncum": 20, "openmeteo": 10},
    "patna-bihar": {"ecmwf": 40, "gfs": 25, "ncum": 25, "openmeteo": 10},
}

@router.get("/{region_id}", response_model=RegionForecastResponse)
async def get_region_forecast(region_id: str):
    """
    Get 7-day multi-model forecast with dynamic Bayesian blended ensemble.
    """
    region = next((r for r in INITIAL_REGIONS if r["id"] == region_id), None)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

    try:
        raw_data = await fetch_openmeteo_forecast(region_id)
        weights = DEFAULT_WEIGHTS.get(region_id, {"ecmwf": 35, "gfs": 35, "ncum": 20, "openmeteo": 10})
        blended = blend_daily_forecast(raw_data["rawDays"], weights)

        return RegionForecastResponse(
            regionId=region_id,
            regionName=region["name"],
            fetchedAt=raw_data["fetchedAt"],
            latencyMs=raw_data["latencyMs"],
            isLive=raw_data["isLive"],
            data=[DailyForecastItem(**item) for item in blended]
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NWP stream ingestion error: {str(e)}")
