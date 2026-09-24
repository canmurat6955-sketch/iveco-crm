"""
Sales Activity database models: SalesActivity and MessageTemplate.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base



class SalesActivity(Base):
    __tablename__ = "sales_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(String(50), nullable=False)  # whatsapp, call, email, visit, meeting
    template_used = Column(String(255), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    message_content = Column(Text, nullable=True)
    status = Column(String(50), default="sent", index=True)  # sent, replied, offer_given, follow_up, hot_lead, converted, lost
    notes = Column(Text, nullable=True)
    next_follow_up = Column(Date, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", foreign_keys=[customer_id])
    user = relationship("User", foreign_keys=[user_id])


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # introduction, follow_up, offer, catalog
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime, nullable=True)
    start_latitude = Column(Float, nullable=True)
    start_longitude = Column(Float, nullable=True)
    end_latitude = Column(Float, nullable=True)
    end_longitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    outcome = Column(String(100), nullable=True)  # Görüşüldü, Teklif Verildi, vb.
    next_action = Column(String(500), nullable=True)
    next_follow_up_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", foreign_keys=[customer_id])
    user = relationship("User", foreign_keys=[user_id])


class RoutePlan(Base):
    __tablename__ = "route_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
    stops = relationship("RouteStop", back_populates="plan", cascade="all, delete-orphan")


class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_plan_id = Column(Integer, ForeignKey("route_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    visited = Column(Boolean, default=False)
    visited_at = Column(DateTime, nullable=True)

    plan = relationship("RoutePlan", back_populates="stops")
    customer = relationship("Customer", foreign_keys=[customer_id])


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id = Column(Integer, ForeignKey("customer_contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    phone_number = Column(String(50), nullable=False, index=True)
    normalized_phone = Column(String(20), nullable=False, index=True)
    direction = Column(String(20), nullable=False)  # inbound, outbound, missed
    duration_seconds = Column(Integer, default=0)
    call_status = Column(String(30), default="completed")  # completed, missed, busy, rejected, no_answer
    call_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    outcome = Column(String(100), nullable=True)  # Teklif İstendi, Fiyat Soruldu, Olumlu, Ulaşılamadı, vb.
    notes = Column(Text, nullable=True)
    recording_url = Column(String(500), nullable=True)
    source = Column(String(50), default="manual")  # android_companion, cloud_pbx, manual, web_click_to_call
    matched_by = Column(String(50), nullable=True)  # customer_phone, contact_phone, manual, unmatched
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", foreign_keys=[customer_id])
    contact = relationship("CustomerContact", foreign_keys=[contact_id])
    user = relationship("User", foreign_keys=[user_id])


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id = Column(Integer, ForeignKey("customer_contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    phone_number = Column(String(50), nullable=False, index=True)
    normalized_phone = Column(String(20), nullable=False, index=True)
    message_id = Column(String(150), nullable=True, index=True)  # Meta wamid or uuid
    direction = Column(String(20), nullable=False)  # inbound, outbound
    sender_name = Column(String(100), nullable=True)
    message_type = Column(String(30), default="text")  # text, template, image, document, location, audio
    content = Column(Text, nullable=False)
    media_url = Column(String(500), nullable=True)
    status = Column(String(30), default="sent")  # sent, delivered, read, failed, received
    source = Column(String(50), default="meta_api")  # meta_api, web_companion, manual_log
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    customer = relationship("Customer", foreign_keys=[customer_id])
    contact = relationship("CustomerContact", foreign_keys=[contact_id])
    user = relationship("User", foreign_keys=[user_id])


