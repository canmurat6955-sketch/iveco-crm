"""
Discovery service: manages sources, runs scrapers, processes discovered companies.
"""
import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi import HTTPException

from app.modules.discovery.models import DiscoverySource, DiscoveredCompany
from app.modules.discovery.schemas import (
    SourceCreate, SourceUpdate, DiscoveredCompanyList,
    DiscoveredCompanyResponse, DiscoveryStats,
)
from app.modules.discovery.sources.demo_source import OrtaKaradenizDemoScraper
from app.modules.crm.models import Customer
from app.modules.crm.service import CRMService
from app.modules.crm.schemas import CustomerCreate
from fuzzywuzzy import fuzz


class DiscoveryService:
    def __init__(self, db: Session):
        self.db = db

    # ── Sources ────────────────────────────────────────────────

    def get_sources(self):
        return self.db.query(DiscoverySource).order_by(DiscoverySource.created_at).all()

    def create_source(self, data: SourceCreate) -> DiscoverySource:
        source = DiscoverySource(**data.model_dump())
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def update_source(self, source_id: int, data: SourceUpdate) -> DiscoverySource:
        source = self.db.query(DiscoverySource).filter(DiscoverySource.id == source_id).first()
        if not source:
            raise HTTPException(status_code=404, detail="Kaynak bulunamadı")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(source, field, value)
        self.db.commit()
        self.db.refresh(source)
        return source

    # ── Run Discovery ──────────────────────────────────────────

    def run_source(self, source_id: int) -> dict:
        """Run a single discovery source and process results."""
        source = self.db.query(DiscoverySource).filter(DiscoverySource.id == source_id).first()
        if not source:
            raise HTTPException(status_code=404, detail="Kaynak bulunamadı")

        source.last_run_status = "running"
        self.db.commit()

        try:
            scraper = self._get_scraper(source)
            raw_companies = scraper.scrape()

            new_count = 0
            for raw in raw_companies:
                # Check if already discovered
                existing = self.db.query(DiscoveredCompany).filter(
                    DiscoveredCompany.company_name == raw.company_name,
                    DiscoveredCompany.city == raw.city,
                ).first()
                if existing:
                    continue

                # Check if already in CRM
                crm_match = self._check_crm_match(raw.company_name, raw.phone, raw.website)
                status = "matched" if crm_match else "new"

                company = DiscoveredCompany(
                    source_id=source.id,
                    company_name=raw.company_name,
                    city=raw.city,
                    district=raw.district,
                    sector=raw.sector,
                    phone=raw.phone,
                    website=raw.website,
                    activity_description=raw.activity_description,
                    contact_info=raw.contact_info,
                    raw_data=raw.raw_data,
                    status=status,
                    matched_customer_id=crm_match,
                )
                self.db.add(company)
                new_count += 1

            source.last_run_at = datetime.now(timezone.utc)
            source.last_run_status = "success"
            source.last_run_count = new_count
            self.db.commit()

            return {"source": source.name, "new_companies": new_count, "status": "success"}

        except Exception as e:
            source.last_run_status = "error"
            self.db.commit()
            raise HTTPException(status_code=500, detail=f"Tarama hatası: {str(e)}")

    def _get_scraper(self, source: DiscoverySource):
        """Get the appropriate scraper for a source."""
        # For MVP, use demo scraper
        return OrtaKaradenizDemoScraper(source.url or "")

    def _check_crm_match(self, name: str, phone: str = None, website: str = None) -> Optional[int]:
        """Check if company already exists in CRM."""
        customers = self.db.query(Customer).filter(Customer.is_active == True).all()
        crm_service = CRMService(self.db)
        for c in customers:
            score = fuzz.token_sort_ratio(name.lower(), c.company_name.lower())
            if score >= 85:
                return c.id
            if phone and c.phone and crm_service._normalize_phone(phone) == crm_service._normalize_phone(c.phone):
                return c.id
            if website and c.website and crm_service._extract_domain(website) == crm_service._extract_domain(c.website):
                return c.id
        return None

    # ── Discovered Companies ───────────────────────────────────

    def get_companies(self, page: int = 1, page_size: int = 20, status_filter: str = None, city: str = None) -> DiscoveredCompanyList:
        query = self.db.query(DiscoveredCompany)
        if status_filter:
            query = query.filter(DiscoveredCompany.status == status_filter)
        if city:
            query = query.filter(DiscoveredCompany.city == city)

        total = query.count()
        items = query.order_by(desc(DiscoveredCompany.discovered_at)).offset((page - 1) * page_size).limit(page_size).all()

        return DiscoveredCompanyList(
            items=[DiscoveredCompanyResponse.model_validate(c) for c in items],
            total=total, page=page, page_size=page_size,
        )

    def get_company(self, company_id: int) -> DiscoveredCompany:
        c = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.id == company_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Firma bulunamadı")
        return c

    def convert_to_customer(self, company_id: int, user_id: int) -> dict:
        """Convert a discovered company to a CRM customer."""
        company = self.get_company(company_id)
        if company.status == "converted":
            raise HTTPException(status_code=400, detail="Bu firma zaten CRM'e aktarılmış")

        crm_service = CRMService(self.db)
        customer_data = CustomerCreate(
            company_name=company.company_name,
            city=company.city,
            district=company.district,
            phone=company.phone,
            website=company.website,
            sector=company.sector,
            sales_notes=company.activity_description,
            potential_score=company.enrichment_score or 0,
            potential_level=self._score_to_level(company.enrichment_score or 0),
        )

        dupes = crm_service.check_duplicate(customer_data)
        if dupes:
            raise HTTPException(status_code=400, detail=f"CRM'de benzer kayıt var: {dupes[0]['customer_name']}")

        customer = crm_service.create_customer(customer_data, source="discovery")
        company.status = "converted"
        company.matched_customer_id = customer.id
        company.processed_at = datetime.now(timezone.utc)
        self.db.commit()

        return {"message": "Firma CRM'e aktarıldı", "customer_id": customer.id}

    def reject_company(self, company_id: int) -> dict:
        company = self.get_company(company_id)
        company.status = "rejected"
        company.processed_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "Firma reddedildi"}

    def _score_to_level(self, score: int) -> str:
        if score >= 75: return "very_high"
        if score >= 55: return "high"
        if score >= 35: return "medium"
        return "low"

    def get_stats(self) -> DiscoveryStats:
        total = self.db.query(DiscoveredCompany).count()
        new_c = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "new").count()
        enriched = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "enriched").count()
        converted = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "converted").count()
        rejected = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "rejected").count()
        by_src = dict(self.db.query(DiscoverySource.name, func.count(DiscoveredCompany.id)).join(DiscoveredCompany).group_by(DiscoverySource.name).all())
        by_city = dict(self.db.query(DiscoveredCompany.city, func.count(DiscoveredCompany.id)).filter(DiscoveredCompany.city.isnot(None)).group_by(DiscoveredCompany.city).all())
        return DiscoveryStats(total_discovered=total, new_count=new_c, enriched_count=enriched, converted_count=converted, rejected_count=rejected, by_source=by_src, by_city=by_city)
