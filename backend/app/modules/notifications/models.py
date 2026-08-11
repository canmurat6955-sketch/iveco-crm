"""
Notification database models.
"""
from datetime import datetime, timezone, time
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Time
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, index=True)  # new_company, high_potential, follow_up, campaign_expiry, system
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    channel = Column(String(20), default="dashboard")  # dashboard, email, daily_digest
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    read_at = Column(DateTime, nullable=True)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    score_threshold = Column(Integer, default=40)
    email_enabled = Column(Boolean, default=False)
    daily_digest_enabled = Column(Boolean, default=True)
    digest_time = Column(String(5), default="08:00")
