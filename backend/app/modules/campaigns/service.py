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

    # ── Finansman & Banka Çatı Matrisleri ──────────────────────────────
    def get_financing_matrices(
        self,
        vehicle_group: Optional[str] = None,
        bank_name: Optional[str] = None,
        active_only: bool = False
    ) -> List:
        from app.modules.campaigns.models import FinancingMatrix
        query = self.db.query(FinancingMatrix)
        if vehicle_group:
            query = query.filter(FinancingMatrix.vehicle_group == vehicle_group)
        if bank_name:
            query = query.filter(FinancingMatrix.bank_name.ilike(f"%{bank_name}%"))
        if active_only:
            query = query.filter(FinancingMatrix.is_active == True)
        return query.order_by(FinancingMatrix.bank_name, FinancingMatrix.campaign_name).all()

    def get_financing_matrix(self, matrix_id: int):
        from app.modules.campaigns.models import FinancingMatrix
        m = self.db.query(FinancingMatrix).filter(FinancingMatrix.id == matrix_id).first()
        if not m:
            raise HTTPException(status_code=404, detail="Finansman matrisi bulunamadı")
        return m

    def create_financing_matrix(self, data):
        from app.modules.campaigns.models import FinancingMatrix
        matrix = FinancingMatrix(
            bank_name=data.bank_name,
            vehicle_group=data.vehicle_group,
            campaign_name=data.campaign_name,
            applicable_models=data.applicable_models,
            validity_period=data.validity_period,
            notes=data.notes,
            tiers_json=data.tiers_json,
            is_active=data.is_active
        )
        self.db.add(matrix)
        self.db.commit()
        self.db.refresh(matrix)
        return matrix

    def update_financing_matrix(self, matrix_id: int, data):
        matrix = self.get_financing_matrix(matrix_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(matrix, field, value)
        self.db.commit()
        self.db.refresh(matrix)
        return matrix

    def delete_financing_matrix(self, matrix_id: int):
        matrix = self.get_financing_matrix(matrix_id)
        self.db.delete(matrix)
        self.db.commit()

    def import_excel_campaign(self, file: UploadFile) -> dict:
        """Excel dosyasından banka çatı kampanyalarını okur ve matrisleri oluşturur/günceller."""
        import json
        import openpyxl
        from app.modules.campaigns.models import FinancingMatrix

        saved_path = self._save_file(file)
        wb = openpyxl.load_workbook(saved_path, data_only=True)
        filename_lower = (file.filename or "").lower()

        default_group = "heavy" if ("heavy" in filename_lower or "sway" in filename_lower or "tway" in filename_lower) else "light_medium"
        created_count = 0

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            clean_name = sheet_name.replace("_", " ").strip()
            
            # Banka adını sheet adından çıkar
            bank_name = "Banka Kampanyası"
            for b in ["KUVEYT TÜRK", "KUVEYTTÜRK", "DENİZBANK", "DENİZ", "GARANTİ", "TEB", "İŞ BANKASI", "İŞBANKASI", "YKB", "AKBANK", "BNPP", "ALBARAKA", "VAKIF KATILIM"]:
                if b.lower() in clean_name.lower():
                    bank_name = "Kuveyt Türk" if "kuveyt" in b.lower() else (
                        "Denizbank" if "deniz" in b.lower() else (
                            "Garanti BBVA" if "garant" in b.lower() else (
                                "İş Bankası" if "iş" in b.lower() else (
                                    "Yapı Kredi" if "ykb" in b.lower() else b.title()
                                )
                            )
                        )
                    )
                    break

            is_grace_period = "ödemesiz" in clean_name.lower() or "odemesiz" in clean_name.lower()
            is_zero_interest = "sıfır" in clean_name.lower() or "sifir" in clean_name.lower() or "0 faiz" in clean_name.lower()

            campaign_name = f"{clean_name} Kampanyası"
            if is_grace_period:
                campaign_name = "6 Ay Ödemesiz - Bayi Katkılı"
            elif is_zero_interest:
                campaign_name = "Sıfır Faiz Avantajlı Finansman"

            # Tiers ayrıştırma
            tiers = []
            curr_tier = None

            for r in range(1, min(ws.max_row + 1, 100)):
                row_vals = [ws.cell(r, c).value for c in range(1, min(ws.max_column + 1, 15))]
                row_str = " ".join([str(v) for v in row_vals if v is not None])

                # Anapara tutarını yakala (örn: 800000, 900000, 1000000, 1500000, 2000000)
                principal_found = None
                for v in row_vals:
                    if isinstance(v, (int, float)) and v >= 500000 and v <= 15000000 and v % 10000 == 0:
                        principal_found = int(v)
                        break

                if principal_found:
                    if curr_tier and curr_tier.get("terms"):
                        tiers.append(curr_tier)
                    curr_tier = {
                        "principal": principal_found,
                        "formatted_principal": f"{principal_found:,.0f} TL".replace(",", "."),
                        "terms": []
                    }

                # Vade & taksit tutarı yakala
                if curr_tier:
                    months = None
                    installment = None
                    rate_str = ""

                    for v in row_vals:
                        if isinstance(v, (int, float)) and v in [6, 8, 9, 12, 18, 24, 25, 36, 48, 60]:
                            months = int(v)
                        if isinstance(v, (int, float)) and v > 15000 and v < 500000:
                            installment = round(float(v))
                        if isinstance(v, (int, float)) and 0 < v < 1:  # faiz oranı örn: 0.0221
                            rate_str = f"%{v * 100:.2f}"
                        elif isinstance(v, str) and "%" in v:
                            rate_str = v.strip()

                    if months and installment:
                        # Tekrar eden ay varsa ekleme
                        if not any(t["months"] == months for t in curr_tier["terms"]):
                            curr_tier["terms"].append({
                                "months": months,
                                "grace_months": 6 if is_grace_period else 0,
                                "monthly_payment": installment,
                                "rate": rate_str
                            })

            if curr_tier and curr_tier.get("terms"):
                tiers.append(curr_tier)

            if tiers:
                matrix = FinancingMatrix(
                    bank_name=bank_name,
                    vehicle_group=default_group,
                    campaign_name=campaign_name,
                    applicable_models="Daily 35, Daily 70, Eurocargo" if default_group == "light_medium" else "S-Way, T-Way, X-Way",
                    validity_period="Güncel Dönem",
                    tiers_json=json.dumps(tiers, ensure_ascii=False),
                    is_active=True,
                    notes=f"{file.filename} dosyasından otomatik aktarıldı."
                )
                self.db.add(matrix)
                created_count += 1

        self.db.commit()
        return {
            "message": f"{created_count} banka çatı kampanyası başarıyla içe aktarıldı.",
            "created_count": created_count,
            "vehicle_group": default_group
        }

