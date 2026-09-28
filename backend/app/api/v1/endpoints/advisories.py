from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any
from app.models.region import INITIAL_REGIONS
from app.schemas.advisory import AdvisoryResponse
from app.services.alerts.cap_generator import generate_cap_xml

router = APIRouter()

ADVISORIES_DATA: Dict[str, Dict[str, Any]] = {
    "mumbai-konkan": {
        "riskLevel": "RED ALERT",
        "riskColor": "red",
        "riskEmoji": "🔴",
        "bulletinId": "IMD-FF-2026-MUM-089",
        "timeValidity": "Next 36 hours",
        "summaryEn": "HEAVY RAIN WARNING: Very heavy rain expected across Mumbai, Thane and Raigad over the next 36 hours. Strong winds up to 60 km/h. Avoid going to coastal or low-lying areas. Do NOT go fishing.",
        "summaryHi": "भारी बारिश की चेतावनी: मुंबई, ठाणे और रायगढ़ में अगले 36 घंटों में बहुत भारी बारिश और 60 किमी/घंटा तक हवाएं। निचले इलाकों और समुद्र तट के पास न जाएं। मछुआरे समुद्र में न जाएं।",
        "summaryTa": "கனமழை எச்சரிக்கை: அடுத்த 36 மணி நேரத்தில் மும்பை, தானே மற்றும் ரைகட் மாவட்டங்களில் மிகவும் கனமழை எதிர்பார்க்கப்படுகிறது. 60 கி.மீ/மணி வேகத்தில் காற்று.",
        "summaryTe": "భారీ వర్షపాత హెచ్చరిక: ముంబై, థానే మరియు రాయగఢ్‌లో వచ్చే 36 గంటల్లో చాలా భారీ వర్షం. 60 కి.మీ/గం వేగంతో గాలులు.",
        "summaryKn" : "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ: ಮುಂಬೈ, ಠಾಣೆ ಮತ್ತು ರಾಯಗಡ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಮುಂದಿನ 36 ಗಂಟೆಗಳಲ್ಲಿ ಅತಿ ಭಾರೀ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.",
        "summaryBn": "ভারী বৃষ্টির সতর্কতা: মুম্বাই, থানে এবং রায়গড়ে আগামী ৩৬ ঘণ্টায় অতি ভারী বৃষ্টি। ৬০ কি.মি./ঘন্টা পর্যন্ত বাতাস।",
        "summaryMr": "जड पावसाची चेतावनी: मुंबई, ठाणे आणि रायगड जिल्ह्यांमध्ये पुढील 36 तासांत अति जड पाऊस. 60 किमी/तास वेगाचे वारे.",
        "summaryPa": "ਭਾਰੀ ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ: ਅਗਲੇ 36 ਘੰਟਿਆਂ ਵਿੱਚ ਮੁੰਬਈ, ਠਾਣੇ ਅਤੇ ਰਾਏਗੜ੍ਹ ਵਿੱਚ ਬਹੁਤ ਭਾਰੀ ਮੀਂਹ ਅਤੇ 60 ਕਿਮੀ/ਘੰਟਾ ਤੱਕ ਤੇਜ਼ ਹਵਾਵਾਂ।",
        "suggestedActions": [
            {"icon": "🚨", "action": "Stay indoors and move to higher ground if you live in low-lying areas."},
            {"icon": "🎣", "action": "Fishermen: Do NOT go to sea. Return to shore immediately."},
            {"icon": "🚗", "action": "Avoid driving through flooded roads. Turn around, don't drown."},
            {"icon": "📱", "action": "Keep your phone charged and follow local government alerts."}
        ],
        "affectedGroups": ["🌊 Coastal residents", "🎣 Fishermen", "🚌 Commuters", "🏘️ Low-lying settlements"]
    },
    "delhi-ncr": {
        "riskLevel": "YELLOW ADVISORY",
        "riskColor": "yellow",
        "riskEmoji": "🟡",
        "bulletinId": "IMD-FF-2026-DEL-042",
        "timeValidity": "Next 24 hours",
        "summaryEn": "HEAT ADVISORY: Warm and dry day expected. Temperature near 38°C. Stay hydrated. Avoid going out between 12pm and 4pm. Elderly and children should remain indoors.",
        "summaryHi": "गर्मी की सलाह: आज गर्म और शुष्क मौसम। तापमान 38°C के करीब। पानी पीते रहें। दोपहर 12 से 4 बजे के बीच बाहर न जाएं। बुजुर्ग और बच्चे घर में रहें।",
        "summaryTa": "வெப்ப அறிவுரை: சூடான மற்றும் வறட்சியான நாள் எதிர்பார்க்கப்படுகிறது. வெப்பநிலை 38°C அருகில்.",
        "summaryTe": "వేడి సలహా: వేడి మరియు శుష్కమైన రోజు ఆశించబడుతోంది. ఉష్ణోగ్రత 38°C దగ్గర.",
        "summaryKn": "ಶಾಖ ಸಲಹೆ: ಬಿಸಿ ಮತ್ತು ಶುಷ್ಕ ದಿನ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ತಾಪಮಾನ 38°C ಹತ್ತಿರ.",
        "summaryBn": "তাপ পরামর্শ: গরম ও শুষ্ক দিন প্রত্যাশিত। তাপমাত্রা ৩৮°C কাছাকাছি।",
        "summaryMr": "उष्णता सल्ला: उष्ण आणि कोरडा दिवस अपेक्षित. तापमान 38°C जवळ.",
        "summaryPa": "ਗਰਮੀ ਦੀ ਚੇਤਾਵਨੀ: ਅੱਜ ਗਰਮ ਅਤੇ ਖੁਸ਼ਕ ਦਿਨ ਰਹਿਣ ਦੀ ਸੰਭਾਵਨਾ। ਤਾਪਮਾਨ 38°C ਦੇ ਨੇੜੇ।",
        "suggestedActions": [
            {"icon": "💧", "action": "Drink water every hour, even if you don't feel thirsty."},
            {"icon": "🏠", "action": "Stay in shade or indoors between 12pm–4pm. Peak heat time."},
            {"icon": "👴", "action": "Check on elderly neighbors — they are most at risk from heat."},
            {"icon": "⚡", "action": "Power grid may be stressed — avoid unnecessary high-energy use."}
        ],
        "affectedGroups": ["👷 Outdoor workers", "👴 Elderly", "👶 Children", "🚜 Farmers"]
    }
}

DEFAULT_ADVISORY = {
    "riskLevel": "GREEN (NORMAL)",
    "riskColor": "green",
    "riskEmoji": "✅",
    "bulletinId": "IMD-FF-2026-GEN-001",
    "timeValidity": "Next 24 hours",
    "summaryEn": "NORMAL WEATHER: No major meteorological hazards expected. Routine atmospheric conditions prevailing.",
    "summaryHi": "सामान्य मौसम: कोई बड़ा खतरा नहीं। सामान्य मौसमी गतिविधियां जारी हैं।",
    "summaryTa": "சாதாரண வானிலை: பெரிய ஆபத்து எதுவும் இல்லை.",
    "summaryTe": "సాధారణ వాతావరణం: పెద్ద ప్రమాదాలు ఆశించబడవు.",
    "summaryKn": "ಸಾಮಾನ್ಯ ಹವಾಮಾನ: ಯಾವುದೇ ಪ್ರಮುಖ ಅಪಾಯ ನಿರೀಕ್ಷಿಸಲಾಗಿಲ್ಲ.",
    "summaryBn": "স্বাভাবিক আবহাওয়া: কোনো বড় বিপদ প্রত্যাশিত নয়।",
    "summaryMr": "सामान्य हवामान: कोणताही मोठा धोका अपेक्षित नाही.",
    "summaryPa": "ਸਾਧਾਰਨ ਮੌਸਮ: ਕੋਈ ਵੱਡਾ ਖ਼ਤਰਾ ਨਹੀਂ।",
    "suggestedActions": [
        {"icon": "📡", "action": "Continue normal monitoring of satellite and AWS data."},
        {"icon": "✅", "action": "All regular outdoor activities are safe to continue."}
    ],
    "affectedGroups": []
}

@router.get("/{region_id}", response_model=AdvisoryResponse)
async def get_advisory(region_id: str):
    """
    Get localized early warning advisory across 8 Indian languages.
    """
    region = next((r for r in INITIAL_REGIONS if r["id"] == region_id), None)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

    adv = ADVISORIES_DATA.get(region_id, DEFAULT_ADVISORY)
    return AdvisoryResponse(
        bulletinId=adv["bulletinId"],
        regionId=region_id,
        riskLevel=adv["riskLevel"],
        riskColor=adv["riskColor"],
        riskEmoji=adv["riskEmoji"],
        timeValidity=adv["timeValidity"],
        summaryEn=adv["summaryEn"],
        summaryHi=adv["summaryHi"],
        summaryTa=adv["summaryTa"],
        summaryTe=adv["summaryTe"],
        summaryKn=adv["summaryKn"],
        summaryBn=adv["summaryBn"],
        summaryMr=adv["summaryMr"],
        summaryPa=adv["summaryPa"],
        suggestedActions=adv["suggestedActions"],
        affectedGroups=adv["affectedGroups"]
    )

@router.get("/{region_id}/cap.xml")
async def get_cap_xml(region_id: str):
    """
    Get OASIS Common Alerting Protocol (CAP-1.2) XML for NDMA early warning integration.
    """
    region = next((r for r in INITIAL_REGIONS if r["id"] == region_id), None)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")

    adv = ADVISORIES_DATA.get(region_id, DEFAULT_ADVISORY)
    xml_str = generate_cap_xml(adv, region)
    return Response(content=xml_str, media_type="application/xml")
