"""
Campaign/catalog database model.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, ForeignKey
from app.core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    file_path = Column(String(1000), nullable=True)
    file_name = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(100), nullable=True)
    validity_start = Column(Date, nullable=True)
    validity_end = Column(Date, nullable=True)
    version = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    CATEGORIES = {
        "daily_catalog": "Iveco Daily Katalog",
        "eurocargo_catalog": "Eurocargo Katalog",
        "sway_catalog": "S-Way Katalog",
        "tway_catalog": "T-Way Katalog",
        "body_solutions": "Hazır Kasa Çözümleri",
        "finance_campaign": "Finans Kampanyası",
        "stock_vehicles": "Stok Araç Listesi",
        "offer_pdf": "Teklif PDF",
    }


class FinancingMatrix(Base):
    __tablename__ = "financing_matrices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bank_name = Column(String(100), nullable=False)  # Kuveyt Türk, Denizbank, Garanti BBVA, TEB, vb.
    vehicle_group = Column(String(50), nullable=False, index=True)  # "light_medium" (Daily, Eurocargo) veya "heavy" (S-Way, T-Way, X-Way)
    campaign_name = Column(String(200), nullable=False)  # "6 Ay Ödemesiz - Bayi Katkılı", "Standart Bayi Kampanyası", vb.
    applicable_models = Column(String(255), nullable=True)  # "Daily 35 Şasi & Van", "Daily 70C & Eurocargo", "S-Way & T-Way"
    validity_period = Column(String(100), nullable=True)  # "Eylül - Ekim 2026"
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    tiers_json = Column(Text, nullable=False, default="[]")  # JSON array of tiers: [ { principal: int, terms: [ { months, grace_months, monthly_payment, total_payment, rate } ] } ]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

