"""
Discovery database models: DiscoverySource and DiscoveredCompany.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class DiscoverySource(Base):
    __tablename__ = "discovery_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)  # trade_chamber, logistics_dir, transport_dir, corporate_dir, company_catalog, website
    url = Column(String(1000), nullable=True)
    scraper_class = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    last_run_status = Column(String(50), nullable=True)  # success, error, running
    last_run_count = Column(Integer, default=0)
    schedule_cron = Column(String(100), default="0 2 * * *")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    companies = relationship("DiscoveredCompany", back_populates="source")

    def __repr__(self):
        return f"<DiscoverySource {self.name}>"


class DiscoveredCompany(Base):
    __tablename__ = "discovered_companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("discovery_sources.id"), nullable=True)
    company_name = Column(String(500), nullable=False, index=True)
    city = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    sector = Column(String(200), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    activity_description = Column(Text, nullable=True)
    contact_info = Column(Text, nullable=True)
    raw_data = Column(JSON, nullable=True)
    status = Column(String(20), default="new", index=True)  # new, enriching, enriched, matched, converted, rejected
    matched_customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    enrichment_score = Column(Integer, nullable=True)
    enrichment_details = Column(JSON, nullable=True)
    discovered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, nullable=True)

    source = relationship("DiscoverySource", back_populates="companies")

    def __repr__(self):
        return f"<DiscoveredCompany {self.company_name}>"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tender_number = Column(String(100), nullable=True, index=True)  # İKN: İhale Kayıt Numarası
    title = Column(String(500), nullable=False)
    organization = Column(String(255), nullable=False)  # Kurum Adı
    city = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)  # Temizlik & Çöp, Lojistik & Nakliye, Fen İşleri, Gıda Dağıtım
    tender_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="announced")  # announced, bidding, awarded, completed
    estimated_vehicles = Column(Integer, default=1)
    suggested_iveco_model = Column(String(255), nullable=True)  # Daily 70C18 Çöp Kasası, Eurocargo vb.
    contractor_name = Column(String(500), nullable=True)  # İhaleyi Kazanan Yüklenici Firma
    contractor_phone = Column(String(50), nullable=True)
    contractor_contact = Column(String(200), nullable=True)
    contract_amount = Column(String(100), nullable=True)  # Sözleşme Bedeli
    notes = Column(Text, nullable=True)
    matched_customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", foreign_keys=[matched_customer_id], lazy="joined")


class BodybuilderPartner(Base):
    __tablename__ = "bodybuilder_partners"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(200), nullable=True)  # Usta veya Yetkili Adı
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True, default="Samsun")
    district = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    specialty = Column(String(255), nullable=False)  # Frigofirik Kasa, Açık Kasa, Damper, Çekici, Vinç vb.
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    referrals = relationship("BodybuilderReferral", back_populates="bodybuilder", cascade="all, delete-orphan")


class BodybuilderReferral(Base):
    __tablename__ = "bodybuilder_referrals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bodybuilder_id = Column(Integer, ForeignKey("bodybuilder_partners.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    requested_chassis = Column(String(255), nullable=True)  # Örn: Daily 35C16, Daily 70C18, Eurocargo
    requested_body = Column(String(255), nullable=True)  # Frigo, Damper, Sac Kasa
    status = Column(String(50), default="new")  # new, contacted, offered, won, lost
    notes = Column(Text, nullable=True)
    crm_customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bodybuilder = relationship("BodybuilderPartner", back_populates="referrals")
    customer = relationship("Customer", foreign_keys=[crm_customer_id], lazy="joined")


class NewCompanyRegistration(Base):
    __tablename__ = "new_company_registrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(500), nullable=False)
    nace_code = Column(String(50), nullable=True)
    nace_description = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True, default="Samsun")
    district = Column(String(100), nullable=True)
    registration_date = Column(DateTime, nullable=True)
    capital = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(50), default="new")  # new, contacted, converted, ignored
    matched_customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", foreign_keys=[matched_customer_id], lazy="joined")

