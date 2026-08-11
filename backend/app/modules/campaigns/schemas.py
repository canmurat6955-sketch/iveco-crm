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
