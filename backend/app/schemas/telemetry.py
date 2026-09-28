from pydantic import BaseModel
from typing import Dict, List, Optional

class SyncCycleLog(BaseModel):
    id: str
    time: str
    status: str
    duration: str
    records: int
    models: str

class PipelineStatusResponse(BaseModel):
    pipelineStatus: str
    lastRunSecondsAgo: int
    nextRunSecondsRemaining: int
    totalCyclesCompleted: int
    recordsIngested: int
    activeAnomalies: int
    syncCyclesLog: List[SyncCycleLog]
    liveLatencies: Dict[str, int]
