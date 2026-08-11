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
