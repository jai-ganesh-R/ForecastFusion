from pydantic import BaseModel
from typing import List

class SuggestedAction(BaseModel):
    icon: str
    action: str

class AdvisoryResponse(BaseModel):
    bulletinId: str
    regionId: str
    riskLevel: str
    riskColor: str
    riskEmoji: str
    timeValidity: str
    summaryEn: str
    summaryHi: str
    summaryTa: str
    summaryTe: str
    summaryKn: str
    summaryBn: str
    summaryMr: str
    summaryPa: str
    suggestedActions: List[SuggestedAction]
    affectedGroups: List[str]
