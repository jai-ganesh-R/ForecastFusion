from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class WeightsInput(BaseModel):
    ecmwf: float = Field(ge=0, le=100)
    gfs: float = Field(ge=0, le=100)
    ncum: float = Field(ge=0, le=100)
    openmeteo: float = Field(ge=0, le=100)

class AttributionFactor(BaseModel):
    factor: str
    impact: float
    desc: str
    simpleDesc: Optional[str] = None

class DriftAlert(BaseModel):
    severity: str
    model: str
    dropPct: int
    period: str
    reason: str
    simpleReason: Optional[str] = None
    actionTaken: str

class TimelineDay(BaseModel):
    day: str
    date: str
    ecmwf: int
    gfs: int
    ncum: int
    openmeteo: int

class RegionWeightsResponse(BaseModel):
    regionId: str
    baselineWeights: Dict[str, int]
    timeline: List[TimelineDay]
    attributions: Dict[str, List[AttributionFactor]]
    driftAlert: Optional[DriftAlert] = None
