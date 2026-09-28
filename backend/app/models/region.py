from sqlalchemy import Column, String, Float, Integer
from app.db.session import Base

class RegionModel(Base):
    __tablename__ = "regions"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    terrain = Column(String(150), nullable=False)
    base_confidence = Column(Integer, nullable=False)
    lead_model = Column(String(50), nullable=False)
    monsoon_phase = Column(String(100), nullable=False)
    active_sensors = Column(Integer, nullable=False, default=100)

INITIAL_REGIONS = [
    {
        "id": "delhi-ncr",
        "name": "Delhi-NCR",
        "state": "National Capital Region",
        "lat": 28.6139,
        "lng": 77.2090,
        "terrain": "Gangetic Plains / Urban Continental",
        "base_confidence": 94,
        "lead_model": "ECMWF-HRES",
        "monsoon_phase": "Post-Monsoon Transition",
        "active_sensors": 142
    },
    {
        "id": "mumbai-konkan",
        "name": "Mumbai & Konkan Coast",
        "state": "Maharashtra",
        "lat": 19.0760,
        "lng": 72.8777,
        "terrain": "Western Ghats Coastal Windward",
        "base_confidence": 89,
        "lead_model": "GFS-FV3",
        "monsoon_phase": "Active Coastal Surge",
        "active_sensors": 218
    },
    {
        "id": "chennai-coromandel",
        "name": "Chennai & Coromandel Coast",
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lng": 80.2707,
        "terrain": "Bay of Bengal Coastal Lowland",
        "base_confidence": 91,
        "lead_model": "NCUM-IMD",
        "monsoon_phase": "Northeast Monsoon Pre-Active",
        "active_sensors": 165
    },
    {
        "id": "kolkata-delta",
        "name": "Kolkata & Sundarbans Delta",
        "state": "West Bengal",
        "lat": 22.5726,
        "lng": 88.3639,
        "terrain": "Estuarine Gangetic Delta",
        "base_confidence": 86,
        "lead_model": "ECMWF-HRES",
        "monsoon_phase": "Depression Formation Watch",
        "active_sensors": 180
    },
    {
        "id": "bengaluru-plateau",
        "name": "Bengaluru Urban Plateau",
        "state": "Karnataka",
        "lat": 12.9716,
        "lng": 77.5946,
        "terrain": "Deccan Plateau Semi-Arid Ridge",
        "base_confidence": 95,
        "lead_model": "Open-Meteo HRRR",
        "monsoon_phase": "Convective Afternoon Regimes",
        "active_sensors": 110
    },
    {
        "id": "hyderabad-telangana",
        "name": "Hyderabad Core & Telangana",
        "state": "Telangana",
        "lat": 17.3850,
        "lng": 78.4867,
        "terrain": "Central Deccan Crystalline Shield",
        "base_confidence": 92,
        "lead_model": "GFS-FV3",
        "monsoon_phase": "Scattered Rainbands",
        "active_sensors": 134
    },
    {
        "id": "jaipur-thar",
        "name": "Jaipur & Eastern Thar Margin",
        "state": "Rajasthan",
        "lat": 26.9124,
        "lng": 75.7873,
        "terrain": "Semi-Arid Aravalli Foothills",
        "base_confidence": 96,
        "lead_model": "ECMWF-HRES",
        "monsoon_phase": "Dry Subsidence",
        "active_sensors": 98
    },
    {
        "id": "guwahati-brahmaputra",
        "name": "Guwahati & Brahmaputra Valley",
        "state": "Assam",
        "lat": 26.1445,
        "lng": 91.7362,
        "terrain": "Sub-Himalayan Orographics",
        "base_confidence": 82,
        "lead_model": "NCUM-IMD",
        "monsoon_phase": "Valley Inversion & Moisture Trapping",
        "active_sensors": 125
    },
    {
        "id": "bhopal-malwa",
        "name": "Bhopal & Malwa Plateau",
        "state": "Madhya Pradesh",
        "lat": 23.2599,
        "lng": 77.4126,
        "terrain": "Central Highland Basalt Traps",
        "base_confidence": 90,
        "lead_model": "GFS-FV3",
        "monsoon_phase": "Moderate Moisture Flux",
        "active_sensors": 104
    },
    {
        "id": "patna-bihar",
        "name": "Patna & Middle Gangetic Plains",
        "state": "Bihar",
        "lat": 25.5941,
        "lng": 85.1376,
        "terrain": "Alluvial Floodplain Corridor",
        "base_confidence": 87,
        "lead_model": "ECMWF-HRES",
        "monsoon_phase": "Riverine High Relative Humidity",
        "active_sensors": 112
    }
]
