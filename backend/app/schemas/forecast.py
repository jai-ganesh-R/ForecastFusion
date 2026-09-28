from pydantic import BaseModel, Field
from typing import List, Optional

class DailyForecastItem(BaseModel):
    time: str
    fullDate: str
    rawDate: str

    blendedRain: float
    blendedTemp: float
    blendedWind: float
    blendedRh: int

    ecmwfRain: float
    ecmwfTemp: float
    ecmwfWind: float
    ecmwfRh: int

    gfsRain: float
    gfsTemp: float
    gfsWind: float
    gfsRh: int

    ncumRain: float
    ncumTemp: float
    ncumWind: float
    ncumRh: int

    openMeteoRain: float
    openMeteoTemp: float
    openMeteoWind: float
    openMeteoRh: int

    spreadRain: float
    spreadTemp: float
    spreadWind: float
    spreadRh: int

    consensus: int
    closestModel: str

class RegionForecastResponse(BaseModel):
    regionId: str
    regionName: str
    fetchedAt: str
    latencyMs: int
    isLive: bool
    data: List[DailyForecastItem]
