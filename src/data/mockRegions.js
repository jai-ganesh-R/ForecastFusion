export const REGIONS = [
  {
    id: "delhi-ncr",
    name: "Delhi-NCR",
    state: "National Capital Region",
    lat: 28.6139,
    lng: 77.2090,
    terrain: "Gangetic Plains / Urban Continental",
    baseConfidence: 94,
    leadModel: "ECMWF-HRES",
    monsoonPhase: "Post-Monsoon Transition",
    activeSensors: 142
  },
  {
    id: "mumbai-konkan",
    name: "Mumbai & Konkan Coast",
    state: "Maharashtra",
    lat: 19.0760,
    lng: 72.8777,
    terrain: "Western Ghats Coastal Windward",
    baseConfidence: 89,
    leadModel: "GFS-FV3",
    monsoonPhase: "Active Coastal Surge",
    activeSensors: 218
  },
  {
    id: "chennai-coromandel",
    name: "Chennai & Coromandel Coast",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    terrain: "Bay of Bengal Coastal Lowland",
    baseConfidence: 91,
    leadModel: "NCUM-IMD",
    monsoonPhase: "Northeast Monsoon Pre-Active",
    activeSensors: 165
  },
  {
    id: "kolkata-delta",
    name: "Kolkata & Sundarbans Delta",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    terrain: "Estuarine Gangetic Delta",
    baseConfidence: 86,
    leadModel: "ECMWF-HRES",
    monsoonPhase: "Depression Formation Watch",
    activeSensors: 180
  },
  {
    id: "bengaluru-plateau",
    name: "Bengaluru Urban Plateau",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    terrain: "Deccan Plateau Semi-Arid Ridge",
    baseConfidence: 95,
    leadModel: "Open-Meteo HRRR",
    monsoonPhase: "Convective Afternoon Regimes",
    activeSensors: 110
  },
  {
    id: "hyderabad-telangana",
    name: "Hyderabad Core & Telangana",
    state: "Telangana",
    lat: 17.3850,
    lng: 78.4867,
    terrain: "Central Deccan Crystalline Shield",
    baseConfidence: 92,
    leadModel: "GFS-FV3",
    monsoonPhase: "Scattered Rainbands",
    activeSensors: 134
  },
  {
    id: "jaipur-thar",
    name: "Jaipur & Eastern Thar Margin",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    terrain: "Semi-Arid Aravalli Foothills",
    baseConfidence: 96,
    leadModel: "ECMWF-HRES",
    monsoonPhase: "Dry Subsidence",
    activeSensors: 98
  },
  {
    id: "guwahati-brahmaputra",
    name: "Guwahati & Brahmaputra Valley",
    state: "Assam",
    lat: 26.1445,
    lng: 91.7362,
    terrain: "Sub-Himalayan Orographics",
    baseConfidence: 82,
    leadModel: "NCUM-IMD",
    monsoonPhase: "Valley Inversion & Moisture Trapping",
    activeSensors: 125
  },
  {
    id: "bhopal-malwa",
    name: "Bhopal & Malwa Plateau",
    state: "Madhya Pradesh",
    lat: 23.2599,
    lng: 77.4126,
    terrain: "Central Highland Basalt Traps",
    baseConfidence: 90,
    leadModel: "GFS-FV3",
    monsoonPhase: "Moderate Moisture Flux",
    activeSensors: 104
  },
  {
    id: "patna-bihar",
    name: "Patna & Middle Gangetic Plains",
    state: "Bihar",
    lat: 25.5941,
    lng: 85.1376,
    terrain: "Alluvial Floodplain Corridor",
    baseConfidence: 87,
    leadModel: "ECMWF-HRES",
    monsoonPhase: "Riverine High Relative Humidity",
    activeSensors: 112
  }
];

export const MODELS_INFO = [
  { id: "ecmwf", name: "ECMWF-HRES 9km", org: "European Centre for Medium-Range Weather Forecasts", biasTendency: "Drifts wet in complex orographic terrain, unmatched 5-day synoptic accuracy" },
  { id: "gfs", name: "NOAA GFS-FV3 13km", org: "National Oceanic & Atmospheric Administration (USA)", biasTendency: "Over-predicts coastal convective peak wind gusts, rapid convective initialization" },
  { id: "ncum", name: "NCUM-IMD 12km", org: "India Meteorological Department / NCMRWF", biasTendency: "Optimal subcontinental boundary layer physics, delayed heavy rainfall onset" },
  { id: "openmeteo", name: "Open-Meteo Ensemble", org: "Open-Meteo Multi-Model Reanalysis", biasTendency: "Ultra-fast high-res interpolation, slight thermal damping in urban microclimates" }
];
