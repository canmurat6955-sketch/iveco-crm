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
