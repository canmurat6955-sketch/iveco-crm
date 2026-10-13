"""
Campaigns Pydantic schemas.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    title: str = Field(..., min_length=2)
    category: str
    description: Optional[str] = None
    validity_start: Optional[date] = None
    validity_end: Optional[date] = None
    version: Optional[str] = None


class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    validity_start: Optional[date] = None
    validity_end: Optional[date] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None


class CampaignResponse(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    validity_start: Optional[date] = None
    validity_end: Optional[date] = None
    version: Optional[str] = None
    is_active: bool
    uploaded_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class FinancingMatrixCreate(BaseModel):
    bank_name: str
    vehicle_group: str  # "light_medium" | "heavy"
    campaign_name: str
    applicable_models: Optional[str] = None
    validity_period: Optional[str] = None
    notes: Optional[str] = None
    tiers_json: str = "[]"
    is_active: bool = True


class FinancingMatrixUpdate(BaseModel):
    bank_name: Optional[str] = None
    vehicle_group: Optional[str] = None
    campaign_name: Optional[str] = None
    applicable_models: Optional[str] = None
    validity_period: Optional[str] = None
    notes: Optional[str] = None
    tiers_json: Optional[str] = None
    is_active: Optional[bool] = None


class FinancingMatrixResponse(BaseModel):
    id: int
    bank_name: str
    vehicle_group: str
    campaign_name: str
    applicable_models: Optional[str] = None
    validity_period: Optional[str] = None
    is_active: bool
    notes: Optional[str] = None
    tiers_json: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

