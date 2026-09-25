// Three independent extreme weather signal status per region
export const getRegionSignals = (regionId) => {
  const signalMap = {
    "delhi-ncr": {
      rainfall: {
        severity: "LOW",
        val: "4 mm / 24h",
        threshold: "< 15 mm (Normal)",
        prob: "14%",
        desc: "Isolated light drizzle possible in southern fringes. Negligible flood hazard.",
        badgeColor: "neonGreen"
      },
      heatwave: {
        severity: "MODERATE",
        val: "37.8 °C",
        threshold: "Departure +2.4°C over normal",
        prob: "48%",
        desc: "High solar insolation index. Urban heat island effect elevating nighttime minimums to 27°C.",
        badgeColor: "neonAmber"
      },
      wind: {
        severity: "LOW",
        val: "18 km/h",
        threshold: "Gusts < 35 km/h",
        prob: "12%",
        desc: "Calm surface boundary layer. Stable conditions.",
        badgeColor: "neonGreen"
      }
    },
    "mumbai-konkan": {
      rainfall: {
        severity: "EXTREME",
        val: "148 mm / 24h",
        threshold: "> 115.5 mm (Very Heavy Rain)",
        prob: "92%",
        desc: "Active offshore trough along Konkan coast feeding torrential monsoon surges. High urban waterlogging risk.",
        badgeColor: "neonRed"
      },
      heatwave: {
        severity: "LOW",
        val: "29.4 °C",
        threshold: "Well below threshold",
        prob: "2%",
        desc: "Overcast cloud shield and sustained precipitation suppressing diurnal thermal peak.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "HIGH",
        val: "54 km/h",
        threshold: "Gusts up to 65 km/h",
        prob: "81%",
        desc: "Gale-force westerly gusts active across harbor and coastal shipping lanes. Fishermen advisory active.",
        badgeColor: "neonAmber"
      }
    },
    "chennai-coromandel": {
      rainfall: {
        severity: "MODERATE",
        val: "38 mm / 24h",
        threshold: "15.6–64.4 mm (Moderate Rain)",
        prob: "58%",
        desc: "Northeast monsoon onset moisture incursion from Bay of Bengal. Scattered urban flooding expected.",
        badgeColor: "neonAmber"
      },
      heatwave: {
        severity: "LOW",
        val: "33.2 °C",
        threshold: "Near normal seasonal range",
        prob: "8%",
        desc: "Maritime humidity moderating thermal stress. Humid but within seasonal bounds.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "MODERATE",
        val: "34 km/h",
        threshold: "Gusts up to 45 km/h",
        prob: "42%",
        desc: "Onshore NE winds strengthening. Coastal erosion risk along Marina Beach esplanade.",
        badgeColor: "neonAmber"
      }
    },
    "kolkata-delta": {
      rainfall: {
        severity: "HIGH",
        val: "74 mm / 24h",
        threshold: "> 64.5 mm (Heavy Rain)",
        prob: "78%",
        desc: "Cyclonic circulation forming in Bay of Bengal interacting with Gangetic convergence zone. Sundarbans flood risk.",
        badgeColor: "neonRed"
      },
      heatwave: {
        severity: "LOW",
        val: "32.1 °C",
        threshold: "Normal humid season range",
        prob: "5%",
        desc: "High relative humidity (85%) suppressing effective temperature perception below threshold.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "HIGH",
        val: "48 km/h",
        threshold: "Gusts up to 60 km/h",
        prob: "74%",
        desc: "Pre-depression squally winds along estuarine channels. Mangrove tide surge watch.",
        badgeColor: "neonAmber"
      }
    },
    "bengaluru-plateau": {
      rainfall: {
        severity: "LOW",
        val: "8 mm / 24h",
        threshold: "< 15 mm (Light Rain)",
        prob: "22%",
        desc: "Scattered afternoon convective cells over Deccan Plateau. Brief spells only.",
        badgeColor: "neonGreen"
      },
      heatwave: {
        severity: "LOW",
        val: "27.4 °C",
        threshold: "Well within normal range",
        prob: "6%",
        desc: "Elevated plateau altitude (920m) naturally moderates thermal extremes. Pleasant conditions.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "LOW",
        val: "14 km/h",
        threshold: "< 30 km/h threshold",
        prob: "10%",
        desc: "Light winds with calm urban boundary layer. No hazard flagged.",
        badgeColor: "neonGreen"
      }
    },
    "hyderabad-telangana": {
      rainfall: {
        severity: "MODERATE",
        val: "26 mm / 24h",
        threshold: "15.6–64.4 mm (Moderate Rain)",
        prob: "46%",
        desc: "Scattered rainbands tracking inland from Bay. Flash flooding risk in low-lying GHMC wards.",
        badgeColor: "neonAmber"
      },
      heatwave: {
        severity: "LOW",
        val: "31.5 °C",
        threshold: "Near normal for season",
        prob: "12%",
        desc: "Monsoon cloud cover moderating daytime heating. Heat index stable.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "LOW",
        val: "22 km/h",
        threshold: "Gusts < 40 km/h",
        prob: "18%",
        desc: "Moderate afternoon convective outflow. No significant gust hazard.",
        badgeColor: "neonGreen"
      }
    },
    "jaipur-thar": {
      rainfall: {
        severity: "LOW",
        val: "0.2 mm / 24h",
        threshold: "Dry",
        prob: "3%",
        desc: "Dry continental airmass dominance. No significant precipitation cells.",
        badgeColor: "neonGreen"
      },
      heatwave: {
        severity: "HIGH",
        val: "42.6 °C",
        threshold: "Departure +4.8°C over normal",
        prob: "88%",
        desc: "Severe dry heat spell across Aravalli western slopes. Prolonged afternoon heat stress warning.",
        badgeColor: "neonRed"
      },
      wind: {
        severity: "MODERATE",
        val: "28 km/h",
        threshold: "Gusts 38 km/h",
        prob: "52%",
        desc: "Afternoon dust-raising surface winds with horizontal visibility reduction.",
        badgeColor: "neonAmber"
      }
    },
    "guwahati-brahmaputra": {
      rainfall: {
        severity: "HIGH",
        val: "88 mm / 24h",
        threshold: "> 64.5 mm (Heavy Rain)",
        prob: "86%",
        desc: "Strong moisture incursion from Bay of Bengal hitting Meghalaya Plateau orography. Flash flood watch.",
        badgeColor: "neonRed"
      },
      heatwave: {
        severity: "LOW",
        val: "28.5 °C",
        threshold: "Normal",
        prob: "4%",
        desc: "Tropical humid saturation with heavy canopy moisture.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "MODERATE",
        val: "32 km/h",
        threshold: "Gusts 40 km/h",
        prob: "45%",
        desc: "Channelized river valley winds near riverine sandbars.",
        badgeColor: "neonAmber"
      }
    },
    "bhopal-malwa": {
      rainfall: {
        severity: "MODERATE",
        val: "22 mm / 24h",
        threshold: "15.6–64.4 mm (Moderate Rain)",
        prob: "40%",
        desc: "Scattered convective activity over Malwa Plateau. Intermittent heavy spells near Betwa basin.",
        badgeColor: "neonAmber"
      },
      heatwave: {
        severity: "LOW",
        val: "31.8 °C",
        threshold: "Near normal",
        prob: "14%",
        desc: "Moderate humidity post-monsoon flux. No heat stress warning warranted.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "LOW",
        val: "17 km/h",
        threshold: "Gusts < 30 km/h",
        prob: "15%",
        desc: "Light southwesterly flow. Stable for agriculture operations.",
        badgeColor: "neonGreen"
      }
    },
    "patna-bihar": {
      rainfall: {
        severity: "HIGH",
        val: "69 mm / 24h",
        threshold: "> 64.5 mm (Heavy Rain)",
        prob: "72%",
        desc: "Monsoon trough dipping south over Bihar plains. Gangetic floodplain activation likely.",
        badgeColor: "neonRed"
      },
      heatwave: {
        severity: "LOW",
        val: "33.4 °C",
        threshold: "Near normal humid range",
        prob: "7%",
        desc: "Heavy moisture flux suppressing thermal extreme. Wet bulb temperature stable.",
        badgeColor: "neonGreen"
      },
      wind: {
        severity: "MODERATE",
        val: "26 km/h",
        threshold: "Gusts up to 38 km/h",
        prob: "38%",
        desc: "Easterly monsoon winds active over Gangetic plain. Riverine navigation caution.",
        badgeColor: "neonAmber"
      }
    }
  };

  return signalMap[regionId] || {
    rainfall: {
      severity: "MODERATE",
      val: "22 mm / 24h",
      threshold: "Moderate Rain",
      prob: "42%",
      desc: "Scattered convective showers with intermittent spells.",
      badgeColor: "neonAmber"
    },
    heatwave: {
      severity: "LOW",
      val: "31.2 °C",
      threshold: "Normal seasonal range",
      prob: "10%",
      desc: "Thermal conditions stable within climatological bounds.",
      badgeColor: "neonGreen"
    },
    wind: {
      severity: "LOW",
      val: "16 km/h",
      threshold: "Gentle Breeze",
      prob: "15%",
      desc: "No high-wind hazard detected.",
      badgeColor: "neonGreen"
    }
  };
};

// Historical skill verification metrics comparing blended vs individual models
export const getRegionSkillMetrics = (regionId) => {
  // Slightly vary metrics per region for realism
  const baseMetrics = {
    "delhi-ncr":            [3.1, 0.6, 3.9, 89.2],
    "mumbai-konkan":        [4.1, 0.8, 5.2, 86.4],
    "chennai-coromandel":   [3.4, 0.7, 4.3, 87.8],
    "kolkata-delta":        [4.8, 0.9, 5.6, 84.1],
    "bengaluru-plateau":    [2.8, 0.6, 3.6, 91.3],
    "hyderabad-telangana":  [3.3, 0.7, 4.1, 88.5],
    "jaipur-thar":          [2.2, 0.5, 3.2, 93.0],
    "guwahati-brahmaputra": [5.4, 1.1, 6.2, 82.3],
    "bhopal-malwa":         [3.0, 0.65, 3.8, 90.1],
    "patna-bihar":          [4.2, 0.85, 5.0, 85.6]
  }[regionId] || [3.2, 0.7, 4.1, 88.4];

  const [rainMae, tempMae, windRmse, ets] = baseMetrics;
  return [
    { metric: "Rainfall MAE (mm)",           Blended: rainMae,     "ECMWF-HRES": rainMae + 3.6,  "GFS-FV3": rainMae + 5.2,  "NCUM-IMD": rainMae + 2.7,  unit: "mm (lower is better)" },
    { metric: "Max Temp MAE (°C)",            Blended: tempMae,     "ECMWF-HRES": tempMae + 0.7,  "GFS-FV3": tempMae + 1.1,  "NCUM-IMD": tempMae + 0.5,  unit: "°C (lower is better)" },
    { metric: "Wind Vector RMSE (km/h)",      Blended: windRmse,    "ECMWF-HRES": windRmse + 3.1, "GFS-FV3": windRmse + 4.8, "NCUM-IMD": windRmse + 2.4, unit: "km/h (lower is better)" },
    { metric: "Overall Threat Score (ETS %)", Blended: ets,         "ECMWF-HRES": ets - 14.2,     "GFS-FV3": ets - 19.3,     "NCUM-IMD": ets - 11.9,    unit: "% (higher is better)" }
  ];
};
