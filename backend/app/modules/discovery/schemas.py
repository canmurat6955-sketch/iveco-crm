"""
Discovery Pydantic schemas.
"""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    name: str
    source_type: str
    url: Optional[str] = None
    scraper_class: Optional[str] = None
    schedule_cron: str = "0 2 * * *"


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = None
    schedule_cron: Optional[str] = None


class SourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    url: Optional[str] = None
    scraper_class: Optional[str] = None
    is_active: bool
    last_run_at: Optional[datetime] = None
    last_run_status: Optional[str] = None
    last_run_count: int
    schedule_cron: str
    created_at: datetime
    model_config = {"from_attributes": True}


class DiscoveredCompanyResponse(BaseModel):
    id: int
    source_id: Optional[int] = None
    company_name: str
    city: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    activity_description: Optional[str] = None
    contact_info: Optional[str] = None
    status: str
    matched_customer_id: Optional[int] = None
    enrichment_score: Optional[int] = None
    enrichment_details: Optional[dict] = None
    discovered_at: datetime
    processed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class DiscoveredCompanyList(BaseModel):
    items: List[DiscoveredCompanyResponse]
    total: int
    page: int
    page_size: int


class DiscoveryStats(BaseModel):
    total_discovered: int
    new_count: int
    enriched_count: int
    converted_count: int
    rejected_count: int
    by_source: dict
    by_city: dict


# ── OSB & Sektörel Radar Schemas ──────────────────────────────────────────

class OsbSearchRequest(BaseModel):
    osb_name: Optional[str] = "Samsun Tekkeköy OSB"
    sector_preset: Optional[str] = "soguk_zincir"  # soguk_zincir, lojistik_ambar, insaat_nalbur, oto_kurtarma, firin_unlu, toptan_gida
    custom_query: Optional[str] = None
    city: Optional[str] = "Samsun"
    limit: int = 20


class OsbSearchResultItem(BaseModel):
    company_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    rating: Optional[float] = None
    google_place_id: Optional[str] = None
    google_maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    iveco_match_score: int = 70
    recommended_iveco: str = "Iveco Daily 35C16"
    target_body_type: Optional[str] = None
    is_existing_customer: bool = False
    existing_customer_id: Optional[int] = None
    existing_customer_name: Optional[str] = None


# ── Kamu & Belediye İhale Radarı Schemas ──────────────────────────────────

class TenderCreate(BaseModel):
    tender_number: Optional[str] = None
    title: str
    organization: str
    city: Optional[str] = "Samsun"
    district: Optional[str] = None
    category: Optional[str] = "Temizlik & Çöp"
    tender_date: Optional[datetime] = None
    status: str = "announced"  # announced, bidding, awarded, completed
    estimated_vehicles: int = 1
    suggested_iveco_model: Optional[str] = None
    contractor_name: Optional[str] = None
    contractor_phone: Optional[str] = None
    contractor_contact: Optional[str] = None
    contract_amount: Optional[str] = None
    notes: Optional[str] = None


class TenderUpdate(BaseModel):
    tender_number: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    tender_date: Optional[datetime] = None
    status: Optional[str] = None
    estimated_vehicles: Optional[int] = None
    suggested_iveco_model: Optional[str] = None
    contractor_name: Optional[str] = None
    contractor_phone: Optional[str] = None
    contractor_contact: Optional[str] = None
    contract_amount: Optional[str] = None
    notes: Optional[str] = None
    matched_customer_id: Optional[int] = None


class TenderResponse(BaseModel):
    id: int
    tender_number: Optional[str] = None
    title: str
    organization: str
    city: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    tender_date: Optional[datetime] = None
    status: str
    estimated_vehicles: int
    suggested_iveco_model: Optional[str] = None
    contractor_name: Optional[str] = None
    contractor_phone: Optional[str] = None
    contractor_contact: Optional[str] = None
    contract_amount: Optional[str] = None
    notes: Optional[str] = None
    matched_customer_id: Optional[int] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Üst Yapıcı (Kasacı / Karoser) Partner Schemas ─────────────────────────

class BodybuilderCreate(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = "Samsun"
    district: Optional[str] = None
    address: Optional[str] = None
    specialty: str
    notes: Optional[str] = None
    is_active: bool = True


class BodybuilderUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    specialty: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class BodybuilderResponse(BaseModel):
    id: int
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    specialty: str
    notes: Optional[str] = None
    is_active: bool
    referrals_count: int = 0
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Üst Yapıcı Müşteri Yönlendirmeleri (Referrals) Schemas ─────────────────

class ReferralCreate(BaseModel):
    bodybuilder_id: int
    customer_name: str
    customer_phone: Optional[str] = None
    city: Optional[str] = "Samsun"
    requested_chassis: Optional[str] = None
    requested_body: Optional[str] = None
    notes: Optional[str] = None


class ReferralUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    crm_customer_id: Optional[int] = None


class ReferralResponse(BaseModel):
    id: int
    bodybuilder_id: int
    bodybuilder_name: Optional[str] = None
    customer_name: str
    customer_phone: Optional[str] = None
    city: Optional[str] = None
    requested_chassis: Optional[str] = None
    requested_body: Optional[str] = None
    status: str
    notes: Optional[str] = None
    crm_customer_id: Optional[int] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Yeni Kurulan Şirketler (Ticaret Sicil / NACE) Schemas ─────────────────

class NewCompanyResponse(BaseModel):
    id: int
    company_name: str
    nace_code: Optional[str] = None
    nace_description: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    registration_date: Optional[datetime] = None
    capital: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    matched_customer_id: Optional[int] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Google Arama & Dijital Niyet Radarı (Web Intent Signals) Schemas ─────

class WebIntentSignalCreate(BaseModel):
    source: str = "google_search"
    search_query: Optional[str] = None
    target_model: Optional[str] = None
    target_campaign: Optional[str] = None
    company_name: Optional[str] = None
    city: Optional[str] = "Samsun"
    district: Optional[str] = None
    phone: Optional[str] = None
    ip_address: Optional[str] = None
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    duration_seconds: int = 45
    scroll_depth: int = 70
    intent_score: int = 85
    intent_level: str = "high"
    matched_customer_id: Optional[int] = None
    notes: Optional[str] = None


class WebIntentSignalUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    matched_customer_id: Optional[int] = None


class WebIntentSignalResponse(BaseModel):
    id: int
    source: str
    search_query: Optional[str] = None
    target_model: Optional[str] = None
    target_campaign: Optional[str] = None
    company_name: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    ip_address: Optional[str] = None
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    duration_seconds: int
    scroll_depth: int
    intent_score: int
    intent_level: str
    matched_customer_id: Optional[int] = None
    matched_customer_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class IntentStatsResponse(BaseModel):
    total_signals: int
    hot_leads_count: int
    google_search_count: int
    whatsapp_campaign_count: int
    avg_intent_score: int
    top_search_queries: List[dict]
    top_target_models: List[dict]
    top_locations: List[dict]


