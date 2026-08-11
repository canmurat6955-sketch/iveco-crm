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


