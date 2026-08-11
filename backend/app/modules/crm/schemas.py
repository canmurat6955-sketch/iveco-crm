"""
CRM Pydantic schemas for request/response validation.
"""

from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Customer Schemas ──────────────────────────────────────────────

class CustomerCreate(BaseModel):
    company_name: str = Field(..., min_length=2, description="Firma adı")
    tax_number: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    sector: Optional[str] = None
    current_fleet: Optional[str] = None
    estimated_fleet_size: Optional[int] = None
    previous_vehicles: Optional[str] = None
    last_contact_date: Optional[date] = None
    segment: str = Field(default="C", description="Müşteri segmenti: A/B/C/D")
    sales_notes: Optional[str] = None
    potential_level: str = Field(default="medium", description="very_high/high/medium/low")
    potential_score: int = Field(default=0, ge=0, le=100)
    pipeline_stage: str = Field(default="lead", description="lead/contact/proposal/negotiation/won/lost")
    pipeline_note: Optional[str] = None
    assigned_to_id: Optional[int] = None
    
    # GPS ve Google Places
    google_place_id: Optional[str] = None
    google_formatted_address: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    tax_number: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    sector: Optional[str] = None
    current_fleet: Optional[str] = None
    estimated_fleet_size: Optional[int] = None
    previous_vehicles: Optional[str] = None
    last_contact_date: Optional[date] = None
    segment: Optional[str] = None
    sales_notes: Optional[str] = None
    potential_level: Optional[str] = None
    potential_score: Optional[int] = Field(None, ge=0, le=100)
    pipeline_stage: Optional[str] = None
    pipeline_note: Optional[str] = None
    assigned_to_id: Optional[int] = None
    is_active: Optional[bool] = None
    
    # GPS ve Google Places
    google_place_id: Optional[str] = None
    google_formatted_address: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CustomerResponse(BaseModel):
    id: int
    company_name: str
    tax_number: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    sector: Optional[str] = None
    current_fleet: Optional[str] = None
    estimated_fleet_size: Optional[int] = None
    previous_vehicles: Optional[str] = None
    last_contact_date: Optional[date] = None
    segment: str
    sales_notes: Optional[str] = None
    potential_level: str
    potential_score: int
    source: str
    pipeline_stage: Optional[str] = "lead"
    pipeline_note: Optional[str] = None
    is_active: bool
    assigned_to_id: Optional[int] = None
    
    # GPS ve Google Places
    google_place_id: Optional[str] = None
    google_formatted_address: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime
    priority_score: Optional[int] = 0

    model_config = {"from_attributes": True}


class CustomerListResponse(BaseModel):
    items: List[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Contact Schemas ──────────────────────────────────────────────────

class ContactCreate(BaseModel):
    contact_name: str = Field(..., min_length=2, description="Kişi adı")
    role: Optional[str] = Field(None, description="Rol: Patron, Şoför, Muhasebeci vs.")
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    is_primary: bool = False


class ContactUpdate(BaseModel):
    contact_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    is_primary: Optional[bool] = None


class ContactResponse(BaseModel):
    id: int
    customer_id: int
    contact_name: str
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    is_primary: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Interaction Schemas ──────────────────────────────────────────

class InteractionCreate(BaseModel):
    interaction_type: str = Field(..., description="call/visit/email/whatsapp/meeting")
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None


class InteractionResponse(BaseModel):
    id: int
    customer_id: int
    user_id: int
    interaction_type: str
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Import Schemas ──────────────────────────────────────────────

class ImportResult(BaseModel):
    total_rows: int
    imported: int
    duplicates: int
    errors: int
    error_details: List[str] = []


# ── Stats Schemas ──────────────────────────────────────────────

class CRMStats(BaseModel):
    total_customers: int
    active_customers: int
    by_segment: dict
    by_potential: dict
    by_city: dict
    by_source: dict
    recent_interactions: int


# ── Duplicate Schemas ──────────────────────────────────────────

class DuplicateGroup(BaseModel):
    match_type: str  # name, phone, domain, location
    match_score: float
    customers: List[CustomerResponse]
