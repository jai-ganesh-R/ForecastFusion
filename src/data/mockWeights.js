// Dynamic weights timeline, SHAP attributions, and drift alerts
// REGION-SPECIFIC attribution factors — each zone has tailored explanations
export const getRegionWeightsData = (regionId) => {
  // Baseline weights per region reflecting real meteorological skill dynamics
  const baselineWeights = {
    "delhi-ncr":            { ecmwf: 45, gfs: 25, ncum: 20, openmeteo: 10 },
    "mumbai-konkan":        { ecmwf: 22, gfs: 48, ncum: 20, openmeteo: 10 },
    "chennai-coromandel":   { ecmwf: 28, gfs: 22, ncum: 40, openmeteo: 10 },
    "kolkata-delta":        { ecmwf: 42, gfs: 20, ncum: 25, openmeteo: 13 },
    "bengaluru-plateau":    { ecmwf: 30, gfs: 20, ncum: 18, openmeteo: 32 },
    "hyderabad-telangana":  { ecmwf: 35, gfs: 35, ncum: 20, openmeteo: 10 },
    "jaipur-thar":          { ecmwf: 52, gfs: 26, ncum: 14, openmeteo:  8 },
    "guwahati-brahmaputra": { ecmwf: 24, gfs: 20, ncum: 46, openmeteo: 10 },
    "bhopal-malwa":         { ecmwf: 36, gfs: 34, ncum: 20, openmeteo: 10 },
    "patna-bihar":          { ecmwf: 40, gfs: 25, ncum: 25, openmeteo: 10 },
  }[regionId] || { ecmwf: 35, gfs: 35, ncum: 20, openmeteo: 10 };

  // 30-day timeline history — varies per region baseline
  const timeline = Array.from({ length: 30 }).map((_, i) => {
    const day = 30 - i;
    const wave = Math.sin(i / 3);
    const gfsMod = Math.round(baselineWeights.gfs + wave * 6);
    const ecmwfMod = Math.round(baselineWeights.ecmwf - wave * 4);
    const ncumMod = Math.round(baselineWeights.ncum + Math.cos(i / 2) * 3);
    const total = gfsMod + ecmwfMod + ncumMod;
    const openmeteoMod = Math.max(5, 100 - total);
    return {
      day: `T-${day}d`,
      date: `Day -${day}`,
      ecmwf: Math.max(5, ecmwfMod),
      gfs: Math.max(5, gfsMod),
      ncum: Math.max(5, ncumMod),
      openmeteo: Math.max(5, openmeteoMod),
    };
  });

  // ── Region-specific SHAP attribution reasons ──────────────────────────────
  const attributionsByRegion = {
    "delhi-ncr": {
      ecmwf: [
        { factor: "Recent Rainfall Accuracy (15 days)", impact: +18.4, desc: "Predicted rainfall within 6% of actual — best among all models for this region.", simpleDesc: "✅ Got rain right 9 out of 10 times recently" },
        { factor: "Heatwave & Temperature Accuracy", impact: +12.6, desc: "Excellent skill in forecasting continental dry heat surges over the Gangetic plain.", simpleDesc: "✅ Very accurate at predicting Delhi heat" },
        { factor: "Overestimates dust-storm winds", impact: -8.2, desc: "Tends to slightly over-predict dry western dust storm intensity from Rajasthan.", simpleDesc: "⚠️ Sometimes over-predicts dust storms" },
        { factor: "Long-range 5-7 day stability", impact: +9.1, desc: "Most stable across the full 7-day lead time window for this region.", simpleDesc: "✅ Reliable forecast 5-7 days ahead" },
      ],
      gfs: [
        { factor: "Convective Storm Timing", impact: +14.2, desc: "Accurately triggers thunderstorm onset within ±35 minutes for afternoon squalls.", simpleDesc: "✅ Good at predicting thunderstorm timing" },
        { factor: "Overestimates moisture (Yamuna basin)", impact: -12.5, desc: "Persistently over-predicts rainfall near river valleys due to soil moisture bias.", simpleDesc: "⚠️ Overestimates rain near rivers" },
        { factor: "Wind Speed (10m surface)", impact: +11.0, desc: "Good correlation with surface anemometer readings during afternoon convection.", simpleDesc: "✅ Decent at surface wind speed" },
        { factor: "Less reliable beyond +72h", impact: -6.8, desc: "Skill degrades faster than ECMWF for forecasts more than 3 days out.", simpleDesc: "⚠️ Less reliable after 3 days" },
      ],
      ncum: [
        { factor: "Indian Boundary Layer Physics", impact: +16.8, desc: "IMD-calibrated model uses Indian-specific land surface temperature parameters.", simpleDesc: "✅ Built specifically for Indian weather patterns" },
        { factor: "Monsoon Cloud Prediction", impact: +7.5, desc: "Good correlation with INSAT satellite cloud data for monsoon seasons.", simpleDesc: "✅ Good monsoon cloud prediction" },
        { factor: "Slow to detect rapid cyclones", impact: -9.5, desc: "3-6 hour lag in detecting intensifying low-pressure systems.", simpleDesc: "⚠️ Can be slow on sudden storms" },
        { factor: "Low-level Jet stream accuracy", impact: +6.2, desc: "Best model for tracking the monsoon low-level jet that drives summer rain.", simpleDesc: "✅ Best at monsoon jet tracking" },
      ],
      openmeteo: [
        { factor: "High-resolution urban details", impact: +12.0, desc: "Sub-kilometer downscaled grid reduces localized urban heat island bias.", simpleDesc: "✅ More detailed for city-level forecasts" },
        { factor: "Real-time station correction", impact: +5.5, desc: "Continuously nudged by AWS ground station data every 30 minutes.", simpleDesc: "✅ Updates from live weather stations" },
        { factor: "Misses peak cloudburst events", impact: -7.0, desc: "Conservative rainfall cap misses extreme single-hour cloudburst spikes.", simpleDesc: "⚠️ May underestimate cloudbursts" },
      ],
    },

    "mumbai-konkan": {
      ecmwf: [
        { factor: "Western Ghats orographic rainfall bias", impact: -18.2, desc: "Overestimates rainfall on windward slopes of Western Ghats by up to 22%.", simpleDesc: "⚠️ Heavily overestimates Ghats rain — PENALIZED" },
        { factor: "Monsoon Surge Detection", impact: +10.4, desc: "Good at detecting large-scale monsoon troughs over the Arabian Sea.", simpleDesc: "✅ Good at detecting Arabian Sea monsoon" },
        { factor: "Coastal wind accuracy (Konkan)", impact: -6.1, desc: "Under-predicts extreme coastal gust events during active monsoon spells.", simpleDesc: "⚠️ Misses strongest Konkan coast gusts" },
        { factor: "5-day synoptic circulation", impact: +9.8, desc: "Reliable for broad weather pattern forecasts beyond 48 hours.", simpleDesc: "✅ Reliable for 3-5 day pattern" },
      ],
      gfs: [
        { factor: "Convective rainfall initiation", impact: +16.8, desc: "Fast convective trigger for offshore and coastal rainfall cells over Mumbai.", simpleDesc: "✅ Quick to detect offshore rain systems" },
        { factor: "Coastal gust accuracy (Colaba)", impact: +13.2, desc: "Best model for harbor wind gusts correlated with DWR Doppler at Colaba.", simpleDesc: "✅ Best for Mumbai harbor wind gusts" },
        { factor: "Arabian Sea moisture column", impact: +9.5, desc: "Accurate precipitable water vapor tracking for sea-fetch rainfall estimation.", simpleDesc: "✅ Good at tracking sea moisture feeding rain" },
        { factor: "Over-predicts extreme events", impact: -5.8, desc: "Occasionally over-predicts peak 1-hour rainfall during cloudburst events.", simpleDesc: "⚠️ Sometimes exaggerates cloudbursts" },
      ],
      ncum: [
        { factor: "India-calibrated boundary layer", impact: +14.5, desc: "IMD-calibrated model handles Indian tropical maritime boundary layer well.", simpleDesc: "✅ Well-calibrated for Indian coastal physics" },
        { factor: "Rainfall onset timing lag", impact: -8.5, desc: "3-4 hour delay in predicting initial heavy rainfall onset at landfall.", simpleDesc: "⚠️ Slightly delayed on storm arrival time" },
        { factor: "Low-level jet tracking (LLJ)", impact: +7.2, desc: "Best at tracking the low-level jet that feeds moisture into Western Ghats.", simpleDesc: "✅ Best at tracking monsoon moisture corridor" },
        { factor: "High-tide combined risk", impact: +5.8, desc: "Accurately models combined sea-surge and rainfall flooding risk periods.", simpleDesc: "✅ Accounts for high-tide + rain flood risk" },
      ],
      openmeteo: [
        { factor: "Urban rainfall downscaling", impact: +10.0, desc: "Sub-km grid resolves neighborhood-level flooding risk across Dharavi-Kurla.", simpleDesc: "✅ Good detail for neighborhood flooding" },
        { factor: "Station nudging frequency", impact: +6.5, desc: "AWS station data integrated every 30 minutes during active monsoon.", simpleDesc: "✅ Very frequent real-time updates" },
        { factor: "Cloudburst cap limitation", impact: -6.5, desc: "Caps extreme hourly rainfall, missing peak cloudburst risk signals.", simpleDesc: "⚠️ Underestimates peak cloudburst hour" },
      ],
    },

    "chennai-coromandel": {
      ecmwf: [
        { factor: "NE Monsoon synoptic pattern", impact: +15.2, desc: "Superior skill in tracking Bay of Bengal cyclonic circulations feeding NE monsoon.", simpleDesc: "✅ Best at tracking NE monsoon systems" },
        { factor: "Bay of Bengal sea surface temps", impact: +10.8, desc: "Accurate SST initialization leads to better rainfall prediction from Bay.", simpleDesc: "✅ Good at using Bay of Bengal sea data" },
        { factor: "Coastal sea roughness underestimate", impact: -7.4, desc: "Slightly underestimates coastal swell heights during active Bay systems.", simpleDesc: "⚠️ Underestimates coastal rough sea severity" },
        { factor: "5-7 day track reliability", impact: +8.9, desc: "Most reliable for tracking Bay of Bengal low pressure systems beyond 3 days.", simpleDesc: "✅ Best for 3-7 day storm tracking" },
      ],
      gfs: [
        { factor: "Rapid cyclogenesis detection", impact: +12.5, desc: "Fast to detect rapid intensification of Bay systems and squall lines.", simpleDesc: "✅ Quick at detecting strengthening storms" },
        { factor: "Coromandel coast wind bias", impact: -9.8, desc: "Over-predicts coastal wind gusts during northeast monsoon active phases.", simpleDesc: "⚠️ Overestimates coastal winds in NE monsoon" },
        { factor: "Offshore convective rainfall", impact: +10.2, desc: "Good at predicting offshore rainfall cells moving onshore from Bay.", simpleDesc: "✅ Reliable for offshore rain moving inland" },
        { factor: "5+ day skill decay", impact: -6.2, desc: "Skill drops faster than ECMWF after 5-day lead time for Bay systems.", simpleDesc: "⚠️ Less reliable for 5+ day Bay forecasts" },
      ],
      ncum: [
        { factor: "NE Monsoon calibration (IMD)", impact: +20.5, desc: "Purpose-calibrated for Tamil Nadu NE monsoon — best tool for this regime.", simpleDesc: "✅ Specifically calibrated for Tamil Nadu monsoon" },
        { factor: "Vellore-Cuddalore rainfall accuracy", impact: +12.8, desc: "Best accuracy for inland districts during northeast monsoon surges.", simpleDesc: "✅ Most accurate for inland Tamil Nadu rain" },
        { factor: "Delayed cyclone intensification", impact: -7.2, desc: "3-6 hour lag in detecting rapid intensification of Bay cyclones.", simpleDesc: "⚠️ Slow on detecting rapid storm strengthening" },
        { factor: "INSAT cloud correlation", impact: +8.4, desc: "Best correlation with INSAT-3DR satellite cloud data for Tamil Nadu.", simpleDesc: "✅ Well-matched to satellite cloud observations" },
      ],
      openmeteo: [
        { factor: "Chennai urban heat correction", impact: +9.5, desc: "Sub-km grid handles Chennai urban heat island effect in coastal forecasts.", simpleDesc: "✅ Good for Chennai city-level detail" },
        { factor: "Real-time AWS integration", impact: +5.8, desc: "Frequent ground-station nudging improves coastal wind accuracy.", simpleDesc: "✅ Frequent real-time data updates" },
        { factor: "Cyclone track limitations", impact: -8.5, desc: "Ensemble averaging smooths out extreme track deviation scenarios.", simpleDesc: "⚠️ Less useful for extreme cyclone tracks" },
      ],
    },

    "jaipur-thar": {
      ecmwf: [
        { factor: "Continental dry heat accuracy", impact: +22.4, desc: "Best model globally for forecasting dry continental heatwave conditions.", simpleDesc: "✅ World's best at predicting dry heat spells" },
        { factor: "Dust storm initiation skill", impact: +14.6, desc: "Accurately models Rajasthan dust storm (andhi) initiation from Thar Desert.", simpleDesc: "✅ Good at predicting Thar dust storms" },
        { factor: "Monsoon onset over Thar", impact: +10.2, desc: "Most reliable for predicting delayed monsoon onset over arid western India.", simpleDesc: "✅ Best for predicting monsoon arrival timing" },
        { factor: "Westerly trough tracking", impact: +8.8, desc: "Superior synoptic circulation skill for westerly disturbances in winter.", simpleDesc: "✅ Best for winter western disturbance" },
      ],
      gfs: [
        { factor: "Temperature maxima accuracy", impact: +12.5, desc: "Good accuracy for peak afternoon temperature forecasts over Rajasthan.", simpleDesc: "✅ Reliable for peak daytime temperatures" },
        { factor: "Soil moisture initialization bias", impact: -14.8, desc: "Over-wets Thar Desert soil initialization, causing rain probability inflation.", simpleDesc: "⚠️ Often predicts rain that doesn't happen" },
        { factor: "Western disturbance tracking", impact: +8.6, desc: "Good at tracking winter western disturbances bringing Rajasthan cold spells.", simpleDesc: "✅ Useful for winter cold spell prediction" },
        { factor: "Monsoon boundary accuracy", impact: -6.4, desc: "Struggles with exact location of monsoon boundary near Thar margin.", simpleDesc: "⚠️ Less accurate for monsoon boundary location" },
      ],
      ncum: [
        { factor: "India-specific heat physics", impact: +10.8, desc: "IMD-calibrated with Indian-specific land surface heat flux parameters.", simpleDesc: "✅ Uses India-specific heat model physics" },
        { factor: "Low rainfall skill in arid zones", impact: -11.2, desc: "Lower skill in very low rainfall arid regions — optimized for wetter zones.", simpleDesc: "⚠️ Less accurate in ultra-dry desert areas" },
        { factor: "Heat index calculation", impact: +9.4, desc: "Accurate wet-bulb temperature and heat stress index for NDMA advisories.", simpleDesc: "✅ Good heat stress index calculation" },
        { factor: "Monsoon onset detection", impact: +7.8, desc: "Best among models at detecting early signs of monsoon onset over Rajasthan.", simpleDesc: "✅ Good at early monsoon signals" },
      ],
      openmeteo: [
        { factor: "High-resolution desert terrain", impact: +8.5, desc: "Sub-km grid resolves dune topography effects on surface wind patterns.", simpleDesc: "✅ Good at desert terrain wind detail" },
        { factor: "Low-moisture reanalysis accuracy", impact: -9.2, desc: "Multi-model averaging inflates low-probability rain chances in arid zones.", simpleDesc: "⚠️ Sometimes over-predicts rain probability" },
        { factor: "Nighttime cooling accuracy", impact: +6.2, desc: "Accurately models rapid desert nighttime cooling cycles.", simpleDesc: "✅ Good at desert night temperature drop" },
      ],
    },
  };

  // Default attributions for all other regions
  const defaultAttributions = {
    ecmwf: [
      { factor: "Recent Rainfall Accuracy (15 days)", impact: +18.4, desc: "Best rainfall prediction accuracy over past 15 days.", simpleDesc: "✅ Most accurate for rain this month" },
      { factor: "Terrain bias correction", impact: -8.2, desc: "Slight drift on complex orographic terrain boundaries.", simpleDesc: "⚠️ Less accurate near hilly areas" },
      { factor: "Long-range forecast coherence", impact: +12.6, desc: "Most stable forecast from +24h to +120h lead times.", simpleDesc: "✅ Reliable 5-day forward forecast" },
      { factor: "Monsoon pattern accuracy", impact: +9.1, desc: "Good monsoon circulation tracking for this region.", simpleDesc: "✅ Good monsoon pattern prediction" },
    ],
    gfs: [
      { factor: "Storm timing accuracy", impact: +14.2, desc: "Accurately triggers storm onset within ±35 minutes.", simpleDesc: "✅ Good at predicting storm timing" },
      { factor: "Moisture overestimation", impact: -12.5, desc: "Overestimates column moisture in river basins.", simpleDesc: "⚠️ Tends to over-predict rain near rivers" },
      { factor: "Surface wind accuracy", impact: +11.0, desc: "Good correlation with surface wind measurements.", simpleDesc: "✅ Good surface wind predictions" },
      { factor: "Beyond-72h skill decay", impact: -6.8, desc: "Skill drops faster than ECMWF for 3+ day forecasts.", simpleDesc: "⚠️ Less reliable beyond 3 days" },
    ],
    ncum: [
      { factor: "Indian monsoon calibration", impact: +16.8, desc: "IMD-calibrated for Indian subcontinent boundary layer.", simpleDesc: "✅ Purpose-built for Indian weather" },
      { factor: "Satellite cloud correlation", impact: +7.5, desc: "Strong correlation with INSAT-3DR cloud observations.", simpleDesc: "✅ Well-matched to satellite data" },
      { factor: "Rapid cyclone lag", impact: -9.5, desc: "3-6 hour lag in rapid cyclone intensification detection.", simpleDesc: "⚠️ Slow on detecting sudden storms" },
      { factor: "Low-level jet tracking", impact: +6.2, desc: "Best model for tracking the monsoon low-level jet.", simpleDesc: "✅ Best monsoon jet prediction" },
    ],
    openmeteo: [
      { factor: "High-resolution urban grid", impact: +12.0, desc: "Sub-kilometer grid resolves local terrain and urban effects.", simpleDesc: "✅ More detailed city-level forecasts" },
      { factor: "Real-time station updates", impact: +5.5, desc: "Near-real-time AWS station data integration.", simpleDesc: "✅ Continuously updated from live stations" },
      { factor: "Peak event underestimation", impact: -7.0, desc: "Conservative clipping of extreme rainfall peaks.", simpleDesc: "⚠️ May underestimate extreme rainfall hours" },
    ],
  };

  const attributions = attributionsByRegion[regionId] || defaultAttributions;

  // Drift alerts for specific regions
  const driftAlerts = {
    "mumbai-konkan": {
      model: "ECMWF-HRES",
      severity: "critical",
      dropPct: 22,
      period: "past 4 days",
      reason: "Significant positive precipitation bias along Western Ghats — overestimating by 22%. Rain error jumped from 4.2mm to 19.8mm.",
      simpleReason: "ECMWF predicted way too much rain over Mumbai hills — so we cut its influence and relied more on GFS and NCUM.",
      actionTaken: "ECMWF weight reduced from 42% → 22%. Extra weight moved to GFS-FV3.",
    },
    "delhi-ncr": {
      model: "GFS-FV3",
      severity: "warning",
      dropPct: 16,
      period: "past 5 days",
      reason: "Over-forecasting dust squalls and peak wind gusts due to dry soil moisture initialization mismatch.",
      simpleReason: "GFS kept predicting dust storms that didn't happen — so we reduced its influence on wind forecasts.",
      actionTaken: "GFS wind weight reduced by 14% across the NCR mesonet.",
    },
    "guwahati-brahmaputra": {
      model: "GFS-FV3",
      severity: "critical",
      dropPct: 27,
      period: "past 7 days",
      reason: "Valley cold-pool inversion mistracking. Severe underestimation of nighttime condensation rain.",
      simpleReason: "GFS completely missed the nighttime fog-rain patterns in Brahmaputra valley — NCUM handles this terrain much better.",
      actionTaken: "GFS capped at 20%; NCUM-IMD elevated to primary (46%).",
    },
  }[regionId] || null;

  return { baselineWeights, timeline, attributions, driftAlert: driftAlerts };
};
