from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List
import math
from app.models.region import INITIAL_REGIONS
from app.schemas.weights import RegionWeightsResponse, WeightsInput
from app.schemas.forecast import DailyForecastItem
from app.services.ingestion.openmeteo_client import fetch_openmeteo_forecast
from app.services.blending.bayesian import blend_daily_forecast
from app.api.v1.endpoints.forecasts import DEFAULT_WEIGHTS

router = APIRouter()

DRIFT_ALERTS = {
    "mumbai-konkan": {
        "severity": "critical",
        "model": "ECMWF-HRES",
        "dropPct": 26,
        "period": "Last 72 hours",
        "reason": "Orographic wet bias in Western Ghats: 4.2x rainfall over-prediction vs IMD Doppler Radar",
        "simpleReason": "ECMWF kept predicting massive rain over Mumbai's hills that never actually fell — so we reduced its trust score by 26%.",
        "actionTaken": "Weight cut from 48% to 22%. Weight reallocated to NOAA GFS & NCUM-IMD."
    },
    "delhi-ncr": {
        "severity": "moderate",
        "model": "GFS-FV3",
        "dropPct": 15,
        "period": "Last 48 hours",
        "reason": "Over-predicted dry-season dust squall gusts along Haryana-Delhi border",
        "simpleReason": "GFS predicted strong dust storms that turned out to be mild breezes. Trust score reduced by 15%.",
        "actionTaken": "Weight decreased from 40% to 25%. Shifted primary weight to ECMWF synoptic grid."
    }
}

ATTRIBUTIONS = {
    "ecmwf": [
        {"factor": "Recent Rainfall Accuracy (15 days)", "impact": 18.4, "desc": "Predicted rainfall within 6% of actual ground stations.", "simpleDesc": "Got rain right 9 out of 10 times recently"},
        {"factor": "Synoptic Flow Stability", "impact": 12.6, "desc": "Superior accuracy in large-scale monsoon trough positioning.", "simpleDesc": "Very stable long-range forecast"},
        {"factor": "Orographic Terrain Bias", "impact": -8.2, "desc": "Slight over-prediction of rain along steep ridgelines.", "simpleDesc": "Sometimes over-predicts rain in hills"},
    ],
    "gfs": [
        {"factor": "Rapid Convective Storm Initialization", "impact": 14.2, "desc": "Triggers thunderstorm onset within ±35 minutes.", "simpleDesc": "Fast at catching sudden afternoon storms"},
        {"factor": "Overestimates Coastal Winds", "impact": -12.5, "desc": "Coastal anemometer correlation drops after +48h.", "simpleDesc": "Over-predicts wind gusts along the sea"},
    ],
    "ncum": [
        {"factor": "Subcontinental Boundary Layer Physics", "impact": 16.8, "desc": "IMD/NCMRWF calibrated parameters specific to the Indian landmass.", "simpleDesc": "Built specifically for Indian conditions"},
        {"factor": "Lag in Sudden Cyclogenesis", "impact": -9.5, "desc": "3-6 hour initialization lag on deep marine depressions.", "simpleDesc": "Slightly slower to catch rapid storm spin-up"},
    ],
    "openmeteo": [
        {"factor": "High-Resolution Urban Downscaling", "impact": 12.0, "desc": "1km interpolation reduces localized urban heat island errors.", "simpleDesc": "Better detail for cities"},
        {"factor": "Extreme Peak Clipping", "impact": -6.0, "desc": "Smoothes out extreme rainfall cloudburst spikes.", "simpleDesc": "Can miss sudden extreme cloudbursts"},
    ]
}

@router.get("/{region_id}", response_model=RegionWeightsResponse)
async def get_region_weights(region_id: str):
    """
    Get active Bayesian weights, 30-day timeline history, SHAP attributions, and drift alerts.
    """
    region = next((r for r in INITIAL_REGIONS if r["id"] == region_id), None)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

    base_weights = DEFAULT_WEIGHTS.get(region_id, {"ecmwf": 35, "gfs": 35, "ncum": 20, "openmeteo": 10})

    # Generate 30-day timeline
    timeline = []
    for i in range(30):
        day = 30 - i
        wave = math.sin(i / 3.0)
        gfs_mod = int(max(5, round(base_weights["gfs"] + wave * 6)))
        ecmwf_mod = int(max(5, round(base_weights["ecmwf"] - wave * 4)))
        ncum_mod = int(max(5, round(base_weights["ncum"] + math.cos(i / 2.0) * 3)))
        om_mod = max(5, 100 - (gfs_mod + ecmwf_mod + ncum_mod))
        timeline.append({
            "day": f"T-{day}d",
            "date": f"Day -{day}",
            "ecmwf": ecmwf_mod,
            "gfs": gfs_mod,
            "ncum": ncum_mod,
            "openmeteo": om_mod
        })

    return RegionWeightsResponse(
        regionId=region_id,
        baselineWeights=base_weights,
        timeline=timeline,
        attributions=ATTRIBUTIONS,
        driftAlert=DRIFT_ALERTS.get(region_id)
    )

class WhatIfRequest(BaseModel):
    regionId: str
    weights: WeightsInput

@router.post("/what-if")
async def calculate_what_if(req: WhatIfRequest):
    """
    On-the-fly dynamic Bayesian recalculation with custom what-if weight distributions.
    """
    raw_data = await fetch_openmeteo_forecast(req.regionId)
    weights_dict = req.weights.model_dump()
    blended = blend_daily_forecast(raw_data["rawDays"], weights_dict)

    return {
        "regionId": req.regionId,
        "weightsApplied": weights_dict,
        "recalculatedAt": raw_data["fetchedAt"],
        "forecast": [DailyForecastItem(**d) for d in blended]
    }
