"""
Campaigns service: file upload and campaign management.
"""
import os
import uuid
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, UploadFile

from app.modules.campaigns.models import Campaign
from app.modules.campaigns.schemas import CampaignCreate, CampaignUpdate
from app.core.config import settings


class CampaignService:
    def __init__(self, db: Session):
        self.db = db

    def get_campaigns(self, category: Optional[str] = None, active_only: bool = False) -> List[Campaign]:
        query = self.db.query(Campaign)
        if category:
            query = query.filter(Campaign.category == category)
        if active_only:
            query = query.filter(Campaign.is_active == True)
        return query.order_by(desc(Campaign.created_at)).all()

    def get_campaign(self, campaign_id: int) -> Campaign:
        c = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Kampanya bulunamadı")
        return c

    def create_campaign(self, data: CampaignCreate, file: Optional[UploadFile], user_id: int) -> Campaign:
        campaign = Campaign(
            title=data.title,
            category=data.category,
            description=data.description,
            validity_start=data.validity_start,
            validity_end=data.validity_end,
            version=data.version,
            uploaded_by_id=user_id,
        )

        if file:
            file_path = self._save_file(file)
            campaign.file_path = file_path
            campaign.file_name = file.filename
            campaign.file_size = file.size
            campaign.file_type = file.content_type

        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def update_campaign(self, campaign_id: int, data: CampaignUpdate) -> Campaign:
        campaign = self.get_campaign(campaign_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(campaign, field, value)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def delete_campaign(self, campaign_id: int):
        campaign = self.get_campaign(campaign_id)
        # Delete file if exists
        if campaign.file_path and os.path.exists(campaign.file_path):
            os.remove(campaign.file_path)
        self.db.delete(campaign)
        self.db.commit()

    def get_file_path(self, campaign_id: int) -> str:
        campaign = self.get_campaign(campaign_id)
        if not campaign.file_path or not os.path.exists(campaign.file_path):
            raise HTTPException(status_code=404, detail="Dosya bulunamadı")
        return campaign.file_path

    def get_categories(self) -> dict:
        return Campaign.CATEGORIES

    def _save_file(self, file: UploadFile) -> str:
        """Save uploaded file to storage directory."""
        upload_dir = settings.FILE_STORAGE_PATH
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        ext = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(upload_dir, unique_name)

        with open(file_path, "wb") as f:
            content = file.file.read()
            f.write(content)

        return file_path
