// Dynamic forecast simulation for the blended ensemble vs individual models
export const generateRegionForecasts = (regionId, weights = null) => {
  const dates = ["Today", "+24h", "+48h", "+72h", "+96h", "+120h", "+144h"];
  
  // Custom baseline variations per region
  const baseProfile = {
    "delhi-ncr":            { temp: 34, rain: 2,  wind: 18, rh: 48 },
    "mumbai-konkan":        { temp: 30, rain: 42, wind: 38, rh: 88 },
    "chennai-coromandel":   { temp: 32, rain: 15, wind: 24, rh: 82 },
    "kolkata-delta":        { temp: 33, rain: 28, wind: 26, rh: 85 },
    "bengaluru-plateau":    { temp: 26, rain: 8,  wind: 15, rh: 65 },
    "hyderabad-telangana":  { temp: 31, rain: 12, wind: 20, rh: 68 },
    "jaipur-thar":          { temp: 38, rain: 0,  wind: 16, rh: 32 },
    "guwahati-brahmaputra": { temp: 29, rain: 52, wind: 22, rh: 92 },
    "bhopal-malwa":         { temp: 31, rain: 14, wind: 17, rh: 64 },
    "patna-bihar":          { temp: 33, rain: 19, wind: 14, rh: 76 }
  }[regionId] || { temp: 30, rain: 10, wind: 20, rh: 65 };

  // Default baseline weights if none provided
  const activeWeights = weights || {
    ecmwf: 40,
    gfs: 25,
    ncum: 20,
    openmeteo: 15
  };

  const totalW = (activeWeights.ecmwf || 0) + 
                 (activeWeights.gfs || 0) + 
                 (activeWeights.ncum || 0) + 
                 (activeWeights.openmeteo || 0) || 100;

  const wEcmwf = (activeWeights.ecmwf || 0) / totalW;
  const wGfs   = (activeWeights.gfs || 0) / totalW;
  const wNcum  = (activeWeights.ncum || 0) / totalW;
  const wOm    = (activeWeights.openmeteo || 0) / totalW;

  return dates.map((time, idx) => {
    // 1. Synthesize individual model rainfall
    // Base rain pattern with temporal progression
    const rainProgression = Math.max(0, baseProfile.rain + Math.sin(idx * 1.1) * (baseProfile.rain * 0.45));
    // ECMWF: smooth, slight orographic bias
    const ecmwfRain = Math.max(0, Math.round(rainProgression * (0.94 + Math.sin(idx) * 0.08)));
    // GFS: tends to predict higher convective peaks
    const gfsRain = Math.max(0, Math.round(rainProgression * (1.14 + (idx % 2 === 0 ? 0.12 : -0.06))));
    // NCUM: IMD regional calibration, strong during monsoon phases
    const ncumRain = Math.max(0, Math.round(rainProgression * (1.02 + Math.cos(idx * 1.3) * 0.09)));
    // Open-Meteo: downscaled resolution, slightly conservative on extreme peaks
    const openMeteoRain = Math.max(0, Math.round(rainProgression * (0.97 - (idx * 0.02))));

    // 2. Synthesize individual model temperature
    const baseTemp = baseProfile.temp + Math.cos(idx * 0.75) * 2.2;
    const ecmwfTemp = Number((baseTemp - 0.6 + Math.sin(idx) * 0.3).toFixed(1));
    const gfsTemp = Number((baseTemp + 1.1 - (idx % 2 === 0 ? 0.2 : -0.4)).toFixed(1));
    const ncumTemp = Number((baseTemp + 0.3 + Math.cos(idx) * 0.4).toFixed(1));
    const openMeteoTemp = Number((baseTemp - 0.2).toFixed(1));

    // 3. Synthesize individual model wind speed
    const baseWind = baseProfile.wind + Math.sin(idx * 0.85) * 5;
    const ecmwfWind = Math.max(2, Math.round(baseWind - 2 + (idx % 3 === 0 ? 3 : -1)));
    const gfsWind = Math.max(2, Math.round(baseWind + 4 + Math.sin(idx * 1.4) * 2));
    const ncumWind = Math.max(2, Math.round(baseWind + 1 - (idx % 2 === 0 ? 2 : -2)));
    const openMeteoWind = Math.max(2, Math.round(baseWind + (Math.cos(idx) * 2)));

    // 4. Synthesize relative humidity (% RH)
    const baseRh = Math.min(98, Math.max(25, baseProfile.rh - (baseTemp - baseProfile.temp) * 2.5));
    const ecmwfRh = Math.min(99, Math.max(20, Math.round(baseRh + 3)));
    const gfsRh = Math.min(99, Math.max(20, Math.round(baseRh - 4)));
    const ncumRh = Math.min(99, Math.max(20, Math.round(baseRh + 1)));
    const openMeteoRh = Math.min(99, Math.max(20, Math.round(baseRh)));

    // ── MATHEMATICAL WEIGHTED BLENDING ───────────────────────────────────
    const blendedRain = Number(Math.max(0, (
      ecmwfRain * wEcmwf + gfsRain * wGfs + ncumRain * wNcum + openMeteoRain * wOm
    )).toFixed(1));

    const blendedTemp = Number((
      ecmwfTemp * wEcmwf + gfsTemp * wGfs + ncumTemp * wNcum + openMeteoTemp * wOm
    ).toFixed(1));

    const blendedWind = Number(Math.max(1, (
      ecmwfWind * wEcmwf + gfsWind * wGfs + ncumWind * wNcum + openMeteoWind * wOm
    )).toFixed(1));

    const blendedRh = Math.min(100, Math.max(15, Math.round(
      ecmwfRh * wEcmwf + gfsRh * wGfs + ncumRh * wNcum + openMeteoRh * wOm
    )));

    // ── ENSEMBLE SPREAD & UNCERTAINTY BOUNDS ──────────────────────────────
    const rainList = [ecmwfRain, gfsRain, ncumRain, openMeteoRain];
    const tempList = [ecmwfTemp, gfsTemp, ncumTemp, openMeteoTemp];
    const windList = [ecmwfWind, gfsWind, ncumWind, openMeteoWind];
    const rhList   = [ecmwfRh, gfsRh, ncumRh, openMeteoRh];

    const minRain = Math.min(...rainList);
    const maxRain = Math.max(...rainList);
    const minTemp = Math.min(...tempList);
    const maxTemp = Math.max(...tempList);
    const minWind = Math.min(...windList);
    const maxWind = Math.max(...windList);
    const minRh   = Math.min(...rhList);
    const maxRh   = Math.max(...rhList);

    // Model Agreement / Consensus Index (higher agreement when spread is low)
    const normSpreadRain = (maxRain - minRain) / (Math.max(1, blendedRain) + 2);
    const normSpreadTemp = (maxTemp - minTemp) / 4;
    const consensusPct = Math.min(99, Math.max(68, Math.round(100 - (normSpreadRain * 12 + normSpreadTemp * 8 + idx * 2.5))));

    // Determine model with closest prediction to blended
    const modelDiffs = [
      { name: 'ECMWF', diff: Math.abs(ecmwfRain - blendedRain) },
      { name: 'GFS', diff: Math.abs(gfsRain - blendedRain) },
      { name: 'NCUM', diff: Math.abs(ncumRain - blendedRain) },
      { name: 'Open-Meteo', diff: Math.abs(openMeteoRain - blendedRain) }
    ].sort((a, b) => a.diff - b.diff);

    return {
      time,
      // Blended estimates
      blendedRain,
      blendedTemp,
      blendedWind,
      blendedRh,

      // ECMWF (Europe)
      ecmwfRain,
      ecmwfTemp,
      ecmwfWind,
      ecmwfRh,

      // GFS (USA)
      gfsRain,
      gfsTemp,
      gfsWind,
      gfsRh,

      // NCUM-IMD (India)
      ncumRain,
      ncumTemp,
      ncumWind,
      ncumRh,

      // Open-Meteo
      openMeteoRain,
      openMeteoTemp,
      openMeteoWind,
      openMeteoRh,

      // Spread bands (for uncertainty shading)
      minRain,
      maxRain,
      spreadRain: Number((maxRain - minRain).toFixed(1)),
      minTemp,
      maxTemp,
      spreadTemp: Number((maxTemp - minTemp).toFixed(1)),
      minWind,
      maxWind,
      spreadWind: Number((maxWind - minWind).toFixed(1)),
      minRh,
      maxRh,
      spreadRh: maxRh - minRh,

      // Consensus & confidence
      consensus: consensusPct,
      leadModelMatch: modelDiffs[0].name,
      confidence: Math.min(99, Math.max(72, Math.round(consensusPct - idx * 1.5)))
    };
  });
};
