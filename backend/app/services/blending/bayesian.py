import numpy as np
from typing import Dict, List, Any

def softmax(x: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Compute temperature-scaled softmax values for array x."""
    e_x = np.exp((x - np.max(x)) / max(0.1, temperature))
    return e_x / e_x.sum(axis=0)

def compute_bayesian_weights(
    skill_scores: Dict[str, float],
    penalties: Dict[str, float] = None,
    temperature: float = 1.2
) -> Dict[str, int]:
    """
    Calculate dynamic Bayesian Model Averaging (BMA) trust weights.
    Higher skill / lower error -> higher weight.
    """
    keys = list(skill_scores.keys())
    scores = np.array([skill_scores[k] for k in keys], dtype=float)

    # Invert error (higher skill = positive advantage)
    normalized_scores = -scores

    if penalties:
        penalty_vec = np.array([penalties.get(k, 0.0) for k in keys], dtype=float)
        normalized_scores -= penalty_vec

    probs = softmax(normalized_scores, temperature=temperature)
    pcts = np.round(probs * 100).astype(int)

    # Ensure sum equals exactly 100%
    diff = 100 - pcts.sum()
    pcts[np.argmax(pcts)] += diff

    return {k: int(pcts[i]) for i, k in enumerate(keys)}

def blend_daily_forecast(
    raw_days: List[Dict[str, Any]],
    weights: Dict[str, float]
) -> List[Dict[str, Any]]:
    """
    Vectorized synthesis of NWP predictions into a unified consensus forecast.
    """
    total_w = sum(weights.values()) or 100.0
    w_ecmwf = weights.get('ecmwf', 40.0) / total_w
    w_gfs   = weights.get('gfs', 25.0) / total_w
    w_ncum  = weights.get('ncum', 20.0) / total_w
    w_om    = weights.get('openmeteo', 15.0) / total_w

    blended_days = []
    for idx, day in enumerate(raw_days):
        ecmwf_rain = day['ecmwfRain']
        gfs_rain   = day['gfsRain']
        ncum_rain  = day['ncumRain']
        om_rain    = day['openMeteoRain']

        blended_rain = round(float(
            ecmwf_rain * w_ecmwf + gfs_rain * w_gfs + ncum_rain * w_ncum + om_rain * w_om
        ), 1)

        ecmwf_temp = day['ecmwfTemp']
        gfs_temp   = day['gfsTemp']
        ncum_temp  = day['ncumTemp']
        om_temp    = day['openMeteoTemp']

        blended_temp = round(float(
            ecmwf_temp * w_ecmwf + gfs_temp * w_gfs + ncum_temp * w_ncum + om_temp * w_om
        ), 1)

        ecmwf_wind = day['ecmwfWind']
        gfs_wind   = day['gfsWind']
        ncum_wind  = day['ncumWind']
        om_wind    = day['openMeteoWind']

        blended_wind = round(max(1.0, float(
            ecmwf_wind * w_ecmwf + gfs_wind * w_gfs + ncum_wind * w_ncum + om_wind * w_om
        )), 1)

        ecmwf_rh = day['ecmwfRh']
        gfs_rh   = day['gfsRh']
        ncum_rh  = day['ncumRh']
        om_rh    = day['openMeteoRh']

        blended_rh = int(np.clip(round(
            ecmwf_rh * w_ecmwf + gfs_rh * w_gfs + ncum_rh * w_ncum + om_rh * w_om
        ), 15, 100))

        # Spread calculation
        rain_arr = [ecmwf_rain, gfs_rain, ncum_rain, om_rain]
        temp_arr = [ecmwf_temp, gfs_temp, ncum_temp, om_temp]
        wind_arr = [ecmwf_wind, gfs_wind, ncum_wind, om_wind]
        rh_arr   = [ecmwf_rh, gfs_rh, ncum_rh, om_rh]

        spread_rain = round(float((max(rain_arr) - min(rain_arr)) / 2.0), 1)
        spread_temp = round(float((max(temp_arr) - min(temp_arr)) / 2.0), 1)
        spread_wind = round(float((max(wind_arr) - min(wind_arr)) / 2.0), 1)
        spread_rh   = int((max(rh_arr) - min(rh_arr)) / 2.0)

        # Consensus score
        norm_spread = (max(rain_arr) - min(rain_arr)) / (max(1.0, blended_rain) + 2.0)
        consensus = int(np.clip(round(100 - (norm_spread * 12 + idx * 2)), 65, 99))

        diffs = [
            ("ECMWF", abs(ecmwf_rain - blended_rain)),
            ("GFS", abs(gfs_rain - blended_rain)),
            ("NCUM", abs(ncum_rain - blended_rain)),
            ("Open-Meteo", abs(om_rain - blended_rain))
        ]
        diffs.sort(key=lambda x: x[1])

        blended_days.append({
            "time": day["time"],
            "fullDate": day["fullDate"],
            "rawDate": day["rawDate"],
            "blendedRain": blended_rain,
            "blendedTemp": blended_temp,
            "blendedWind": blended_wind,
            "blendedRh": blended_rh,
            "ecmwfRain": ecmwf_rain,
            "ecmwfTemp": ecmwf_temp,
            "ecmwfWind": ecmwf_wind,
            "ecmwfRh": ecmwf_rh,
            "gfsRain": gfs_rain,
            "gfsTemp": gfs_temp,
            "gfsWind": gfs_wind,
            "gfsRh": gfs_rh,
            "ncumRain": ncum_rain,
            "ncumTemp": ncum_temp,
            "ncumWind": ncum_wind,
            "ncumRh": ncum_rh,
            "openMeteoRain": om_rain,
            "openMeteoTemp": om_temp,
            "openMeteoWind": om_wind,
            "openMeteoRh": om_rh,
            "spreadRain": spread_rain,
            "spreadTemp": spread_temp,
            "spreadWind": spread_wind,
            "spreadRh": spread_rh,
            "consensus": consensus,
            "closestModel": diffs[0][0]
        })

    return blended_days
