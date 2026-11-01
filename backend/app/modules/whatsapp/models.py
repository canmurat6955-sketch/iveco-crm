"""
WhatsApp integration models.
Stores session state and outgoing/incoming message logs.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base


class WhatsAppSession(Base):
    __tablename__ = "whatsapp_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), unique=True, nullable=False, default="default")
    status = Column(String(50), default="disconnected", index=True)  # disconnected, qr_ready, connected
    phone_number = Column(String(50), nullable=True)
    display_name = Column(String(100), nullable=True)
    qr_data = Column(Text, nullable=True)
    auto_notify_rep = Column(Boolean, default=True)
    notify_phone = Column(String(50), default="905446225931")
    connected_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class WhatsAppMessageLog(Base):
    __tablename__ = "whatsapp_message_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipient_phone = Column(String(50), nullable=False)
    recipient_name = Column(String(100), nullable=True)
    message_type = Column(String(50), default="text")  # proposal, catalog, alert, test
    content = Column(Text, nullable=False)
    status = Column(String(50), default="sent")  # pending, sent, delivered, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
