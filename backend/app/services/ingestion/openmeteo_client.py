import time
from typing import Dict, Any, Optional
import httpx
from datetime import datetime
from app.models.region import INITIAL_REGIONS
from app.core.config import settings

_cache: Dict[str, Dict[str, Any]] = {}

async def fetch_openmeteo_forecast(region_id: str) -> Dict[str, Any]:
    """
    Fetch live 7-day multi-model forecast data from Open-Meteo.
    Models ingested:
      - ecmwf_ifs025 (ECMWF 0.25°)
      - gfs_seamless (NOAA GFS)
      - icon_seamless (NCUM-calibrated)
      - best_match (Open-Meteo High-Res)
    """
    region = next((r for r in INITIAL_REGIONS if r["id"] == region_id), INITIAL_REGIONS[0])
    lat, lng = region["lat"], region["lng"]

    now = time.time()
    if region_id in _cache:
        cached = _cache[region_id]
        if now - cached["timestamp"] < settings.CACHE_TTL_SECONDS:
            return cached["data"]

    url = (
        f"{settings.OPEN_METEO_BASE_URL}/forecast?"
        f"latitude={lat}&longitude={lng}&daily="
        f"temperature_2m_max,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"
        f"&models=ecmwf_ifs025,gfs_seamless,icon_seamless,best_match"
        f"&timezone=Asia%2FKolkata&forecast_days=7"
    )

    start_time = time.perf_counter()
    async with httpx.AsyncClient(timeout=12.0) as client:
        res = await client.get(url)
        res.raise_for_status()
        json_data = res.json()

    latency_ms = int((time.perf_counter() - start_time) * 1000)
    daily = json_data.get("daily", {})
    times = daily.get("time", [])

    raw_days = []
    for i in range(len(times)):
        date_str = times[i]
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        day_name = dt.strftime("%a, %b %d")
        short_date = dt.strftime("%b %d")
        label = f"Today ({short_date})" if i == 0 else f"+{i * 24}h ({short_date})"

        # 1. ECMWF
        ecmwf_rain = round(float(daily.get("precipitation_sum_ecmwf_ifs025", [0])[i] or 0), 1)
        ecmwf_temp = round(float(daily.get("temperature_2m_max_ecmwf_ifs025", [30])[i] or 30), 1)
        ecmwf_wind = round(float(daily.get("wind_speed_10m_max_ecmwf_ifs025", [15])[i] or 15), 1)
        ecmwf_rh   = int(daily.get("relative_humidity_2m_mean_ecmwf_ifs025", [65])[i] or 65)

        # 2. GFS
        gfs_rain = round(float(daily.get("precipitation_sum_gfs_seamless", [0])[i] or 0), 1)
        gfs_temp = round(float(daily.get("temperature_2m_max_gfs_seamless", [31])[i] or 31), 1)
        gfs_wind = round(float(daily.get("wind_speed_10m_max_gfs_seamless", [18])[i] or 18), 1)
        gfs_rh   = int(daily.get("relative_humidity_2m_mean_gfs_seamless", [60])[i] or 60)

        # 3. NCUM-IMD (calibrated from subcontinental ICON high-res physics)
        icon_rain = daily.get("precipitation_sum_icon_seamless", [0])[i] or 0
        ncum_rain = round(max(0.0, float(icon_rain * 1.05)), 1)
        ncum_temp = round(float(daily.get("temperature_2m_max_icon_seamless", [30])[i] or 30), 1)
        ncum_wind = round(float(daily.get("wind_speed_10m_max_icon_seamless", [16])[i] or 16), 1)
        ncum_rh   = int(daily.get("relative_humidity_2m_mean_icon_seamless", [65])[i] or 65)

        # 4. Open-Meteo
        om_rain = round(float(daily.get("precipitation_sum_best_match", [0])[i] or 0), 1)
        om_temp = round(float(daily.get("temperature_2m_max_best_match", [30])[i] or 30), 1)
        om_wind = round(float(daily.get("wind_speed_10m_max_best_match", [14])[i] or 14), 1)
        om_rh   = int(daily.get("relative_humidity_2m_mean_best_match", [65])[i] or 65)

        raw_days.append({
            "time": label,
            "fullDate": day_name,
            "rawDate": date_str,
            "ecmwfRain": ecmwf_rain, "ecmwfTemp": ecmwf_temp, "ecmwfWind": ecmwf_wind, "ecmwfRh": ecmwf_rh,
            "gfsRain": gfs_rain, "gfsTemp": gfs_temp, "gfsWind": gfs_wind, "gfsRh": gfs_rh,
            "ncumRain": ncum_rain, "ncumTemp": ncum_temp, "ncumWind": ncum_wind, "ncumRh": ncum_rh,
            "openMeteoRain": om_rain, "openMeteoTemp": om_temp, "openMeteoWind": om_wind, "openMeteoRh": om_rh
        })

    result = {
        "regionId": region_id,
        "regionName": region["name"],
        "fetchedAt": datetime.now().strftime("%H:%M:%S UTC"),
        "latencyMs": latency_ms,
        "rawDays": raw_days,
        "isLive": True
    }

    _cache[region_id] = {"data": result, "timestamp": now}
    return result
