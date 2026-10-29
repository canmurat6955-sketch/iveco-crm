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
from app.modules.campaigns.schemas import (
    CampaignUpdate, CampaignResponse,
    FinancingMatrixCreate, FinancingMatrixUpdate, FinancingMatrixResponse
)

router = APIRouter(prefix="/api/campaigns", tags=["Kampanyalar"])


# ── Finansman & Banka Çatı Matrisleri Endpointleri ──────────────────

@router.get("/financing/matrices", response_model=List[FinancingMatrixResponse])
def list_financing_matrices(
    vehicle_group: Optional[str] = Query(None),
    bank_name: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).get_financing_matrices(vehicle_group, bank_name, active_only)


@router.get("/financing/matrices/{matrix_id}", response_model=FinancingMatrixResponse)
def get_financing_matrix(
    matrix_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).get_financing_matrix(matrix_id)


@router.post("/financing/matrices", response_model=FinancingMatrixResponse)
def create_financing_matrix(
    data: FinancingMatrixCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).create_financing_matrix(data)


@router.put("/financing/matrices/{matrix_id}", response_model=FinancingMatrixResponse)
def update_financing_matrix(
    matrix_id: int,
    data: FinancingMatrixUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).update_financing_matrix(matrix_id, data)


@router.delete("/financing/matrices/{matrix_id}")
def delete_financing_matrix(
    matrix_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    CampaignService(db).delete_financing_matrix(matrix_id)
    return {"message": "Finansman matrisi silindi"}


@router.post("/financing/upload-excel")
def upload_campaign_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CampaignService(db).import_excel_campaign(file)


# ── Standart Kampanya & Katalog Endpointleri ───────────────────────

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


@router.get("/outreach/recipients")
def get_campaign_recipients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """WhatsApp üzerinden kampanya iletilen ve okunan firmaları listeler."""
    from app.modules.sales_activity.models import WhatsAppMessage
    from app.modules.crm.models import Customer
    
    messages = (
        db.query(WhatsAppMessage)
        .filter(
            WhatsAppMessage.media_url.ilike("%kuveyt_turk_daily_6ay%") |
            WhatsAppMessage.content.ilike("%Daily Şasi kampanyamızı%")
        )
        .order_by(WhatsAppMessage.created_at.desc())
        .all()
    )
    
    result = []
    for m in messages:
        c = m.customer
        if not c:
            continue
        result.append({
            "id": m.id,
            "customer_id": c.id,
            "company_name": c.company_name,
            "phone": m.phone_number,
            "district": c.district,
            "city": c.city,
            "sector": c.sector,
            "status": m.status,
            "read_time": m.created_at.strftime("%H:%M") if m.created_at else None,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "sender_name": m.sender_name or "Murat Onay",
            "content": m.content,
            "media_url": m.media_url,
            "pipeline_stage": c.pipeline_stage,
            "potential_score": c.potential_score,
            "segment": c.segment,
        })
    return result
