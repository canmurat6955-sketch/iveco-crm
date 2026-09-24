"""
Sales Activity Pydantic schemas.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class SalesActivityCreate(BaseModel):
    customer_id: int
    activity_type: str = Field(..., description="whatsapp/call/email/visit/meeting")
    template_used: Optional[str] = None
    campaign_id: Optional[int] = None
    message_content: Optional[str] = None
    status: str = "sent"
    notes: Optional[str] = None
    next_follow_up: Optional[date] = None


class SalesActivityUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_follow_up: Optional[date] = None


class SalesActivityResponse(BaseModel):
    id: int
    customer_id: int
    user_id: int
    activity_type: str
    template_used: Optional[str] = None
    campaign_id: Optional[int] = None
    message_content: Optional[str] = None
    status: str
    notes: Optional[str] = None
    next_follow_up: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None
    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    name: str
    content: str
    category: str


class TemplateResponse(BaseModel):
    id: int
    name: str
    content: str
    category: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class PipelineSummary(BaseModel):
    sent: int = 0
    replied: int = 0
    offer_given: int = 0
    follow_up: int = 0
    hot_lead: int = 0
    converted: int = 0
    lost: int = 0
    total: int = 0


class VisitStart(BaseModel):
    customer_id: int
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None
    accuracy: Optional[float] = None
    address: Optional[str] = None


class VisitEnd(BaseModel):
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None
    next_follow_up_date: Optional[date] = None
    end_latitude: Optional[float] = None
    end_longitude: Optional[float] = None


class VisitResponse(BaseModel):
    id: int
    customer_id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None
    end_latitude: Optional[float] = None
    end_longitude: Optional[float] = None
    accuracy: Optional[float] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None
    next_follow_up_date: Optional[date] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class RouteStopCreate(BaseModel):
    customer_id: int
    sequence_order: int


class RouteStopResponse(BaseModel):
    id: int
    customer_id: int
    sequence_order: int
    visited: bool
    visited_at: Optional[datetime] = None
    company_name: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    model_config = {"from_attributes": True}


class RoutePlanCreate(BaseModel):
    name: str
    date: date
    stops: List[RouteStopCreate]


class RoutePlanResponse(BaseModel):
    id: int
    user_id: int
    name: str
    date: date
    created_at: datetime
    stops: List[RouteStopResponse]
    model_config = {"from_attributes": True}


class RouteOptimizeRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    customer_ids: List[int]


class OptimizedStop(BaseModel):
    customer_id: int
    sequence_order: int
    distance_from_previous: float  # Metre


class RouteOptimizeResponse(BaseModel):
    optimized_stops: List[OptimizedStop]
    total_distance: float  # Metre


# ── Call Tracking Schemas ──────────────────────────────────────────

class CallLogCreate(BaseModel):
    phone_number: str
    direction: str = Field(default="outbound", description="inbound, outbound, missed")
    duration_seconds: int = 0
    call_status: str = "completed"
    call_date: Optional[datetime] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None
    recording_url: Optional[str] = None
    source: str = "manual"
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None


class CallLogSyncItem(BaseModel):
    phone_number: str
    direction: str
    duration_seconds: int = 0
    call_status: str = "completed"
    call_date: datetime
    notes: Optional[str] = None
    source: str = "android_companion"


class CallLogSyncRequest(BaseModel):
    items: List[CallLogSyncItem]


class CallLogResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    user_id: int
    phone_number: str
    normalized_phone: str
    direction: str
    duration_seconds: int
    call_status: str
    call_date: datetime
    outcome: Optional[str] = None
    notes: Optional[str] = None
    recording_url: Optional[str] = None
    source: str
    matched_by: Optional[str] = None
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class CallStatsResponse(BaseModel):
    total_calls: int = 0
    total_duration_seconds: int = 0
    inbound_count: int = 0
    outbound_count: int = 0
    missed_count: int = 0
    unmatched_count: int = 0


class ConvertToLeadRequest(BaseModel):
    company_name: str
    contact_name: Optional[str] = None
    city: Optional[str] = "Samsun"
    district: Optional[str] = None
    sector: Optional[str] = None


# ── WhatsApp Schemas ───────────────────────────────────────────────

class WhatsAppMessageCreate(BaseModel):
    phone_number: str
    content: str
    direction: str = "outbound"
    message_type: str = "text"
    media_url: Optional[str] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None


class WhatsAppSendRequest(BaseModel):
    customer_id: int
    message: str
    template_name: Optional[str] = None


class WhatsAppMessageResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    user_id: Optional[int] = None
    phone_number: str
    normalized_phone: str
    message_id: Optional[str] = None
    direction: str
    sender_name: Optional[str] = None
    message_type: str
    content: str
    media_url: Optional[str] = None
    status: str
    source: str
    created_at: datetime
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    model_config = {"from_attributes": True}


class CommunicationsTimelineItem(BaseModel):
    id: int
    item_type: str  # "call" | "whatsapp" | "visit"
    timestamp: datetime
    title: str
    summary: Optional[str] = None
    direction: Optional[str] = None  # "inbound" | "outbound"
    duration_seconds: Optional[int] = None
    outcome: Optional[str] = None
    status: Optional[str] = None
    media_url: Optional[str] = None
    actor_name: Optional[str] = None



