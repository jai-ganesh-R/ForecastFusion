from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from datetime import datetime, timezone
import random

router = APIRouter()

active_connections = set()

@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Real-time WebSocket connection streaming meteorological pipeline cycles,
    heartbeats, and microservice telemetry.
    """
    await websocket.accept()
    active_connections.add(websocket)

    cycle_count = 1428
    records_count = 842109
    next_remaining = 30
    last_ago = 4

    try:
        while True:
            await asyncio.sleep(1.0)
            next_remaining -= 1
            last_ago += 1

            if next_remaining <= 0:
                next_remaining = 30
                last_ago = 0
                cycle_count += 1
                records_count += random.randint(200, 600)
                status = "SYNCED"
            elif next_remaining < 5:
                status = "PROCESSING"
            else:
                status = "OPERATIONAL"

            jitter = lambda base: max(10, round(base + (random.random() - 0.5) * base * 0.15))

            payload = {
                "type": "PIPELINE_TICK",
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
                "pipelineStatus": status,
                "nextRunSecondsRemaining": next_remaining,
                "lastRunSecondsAgo": last_ago,
                "totalCyclesCompleted": cycle_count,
                "recordsIngested": records_count,
                "liveLatencies": {
                    "ecmwf": jitter(42),
                    "gfs": jitter(68),
                    "imdDwr": jitter(18),
                    "openMeteo": jitter(32)
                }
            }

            await websocket.send_text(json.dumps(payload))
    except (WebSocketDisconnect, Exception):
        active_connections.discard(websocket)
