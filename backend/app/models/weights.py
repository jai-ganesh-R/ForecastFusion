from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
from app.db.session import Base

class DriftEventModel(Base):
    __tablename__ = "drift_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    region_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    model = Column(String(50), nullable=False)
    event_type = Column(String(20), nullable=False)  # 'PENALTY' | 'RECOVERY' | 'PROMOTION'
    weight_delta = Column(Integer, nullable=False)
    new_weight = Column(Integer, nullable=False)
    trigger_reason = Column(String(255), nullable=False)
