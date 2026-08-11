"""
Campaigns API endpoints.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.campaigns.service import CampaignService
from app.modules.campaigns.schemas import CampaignUpdate, CampaignResponse

router = APIRouter(prefix="/api/campaigns", tags=["Kampanyalar"])


@router.get("", response_model=List[CampaignResponse])
def list_campaigns(
    category: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).get_campaigns(category, active_only)


@router.get("/categories")
def get_categories(current_user=Depends(get_current_user)):
    from app.modules.campaigns.models import Campaign
    return Campaign.CATEGORIES


@router.get("/active", response_model=List[CampaignResponse])
def active_campaigns(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return CampaignService(db).get_campaigns(active_only=True)


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return CampaignService(db).get_campaign(campaign_id)


@router.post("", response_model=CampaignResponse)
def create_campaign(
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    validity_start: Optional[str] = Form(None),
    validity_end: Optional[str] = Form(None),
    version: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.modules.campaigns.schemas import CampaignCreate
    data = CampaignCreate(
        title=title, category=category, description=description,
        validity_start=date.fromisoformat(validity_start) if validity_start else None,
        validity_end=date.fromisoformat(validity_end) if validity_end else None,
        version=version,
    )
    return CampaignService(db).create_campaign(data, file, current_user.id)


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: int, data: CampaignUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return CampaignService(db).update_campaign(campaign_id, data)


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    CampaignService(db).delete_campaign(campaign_id)
    return {"message": "Kampanya silindi"}


@router.get("/{campaign_id}/download")
def download_file(campaign_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    path = CampaignService(db).get_file_path(campaign_id)
    campaign = CampaignService(db).get_campaign(campaign_id)
    return FileResponse(path, filename=campaign.file_name, media_type=campaign.file_type)
