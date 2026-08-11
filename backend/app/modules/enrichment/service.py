"""
Enrichment service: runs scoring on discovered companies.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException

from app.modules.discovery.models import DiscoveredCompany
from app.modules.enrichment.scoring import score_company, ScoreBreakdown
from app.core.config import settings


class EnrichmentService:
    def __init__(self, db: Session):
        self.db = db

    def enrich_company(self, company_id: int) -> dict:
        """Run enrichment/scoring on a single discovered company."""
        company = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Firma bulunamadı")

        company.status = "enriching"
        self.db.commit()

        result = score_company(
            company_name=company.company_name,
            sector=company.sector,
            activity_description=company.activity_description,
            website=company.website,
            phone=company.phone,
            city=company.city,
        )

        company.enrichment_score = result.total_score
        company.enrichment_details = {
            "signals": result.signals,
            "potential_level": result.potential_level,
        }
        company.status = "enriched"
        company.processed_at = datetime.now(timezone.utc)
        self.db.commit()

        return {
            "company_id": company.id,
            "company_name": company.company_name,
            "score": result.total_score,
            "potential_level": result.potential_level,
            "signals": result.signals,
            "above_threshold": result.total_score >= settings.SCORE_THRESHOLD,
        }

    def batch_enrich(self) -> dict:
        """Enrich all pending (new) discovered companies."""
        pending = self.db.query(DiscoveredCompany).filter(
            DiscoveredCompany.status == "new"
        ).all()

        results = {"total": len(pending), "enriched": 0, "above_threshold": 0}

        for company in pending:
            try:
                result = self.enrich_company(company.id)
                results["enriched"] += 1
                if result["above_threshold"]:
                    results["above_threshold"] += 1
            except Exception:
                continue

        return results

    def get_queue(self):
        """Get companies waiting for enrichment."""
        return self.db.query(DiscoveredCompany).filter(
            DiscoveredCompany.status.in_(["new", "enriching"])
        ).order_by(desc(DiscoveredCompany.discovered_at)).all()

    def get_config(self) -> dict:
        """Return current scoring configuration."""
        from app.modules.enrichment.scoring import (
            LOGISTICS_KEYWORDS, HEAVY_VEHICLE_KEYWORDS,
            LIGHT_COMMERCIAL_KEYWORDS, FLEET_KEYWORDS,
        )
        return {
            "score_threshold": settings.SCORE_THRESHOLD,
            "weights": {
                "logistics": {"max_score": 30, "keywords_count": len(LOGISTICS_KEYWORDS)},
                "heavy_vehicle": {"max_score": 25, "keywords_count": len(HEAVY_VEHICLE_KEYWORDS)},
                "light_commercial": {"max_score": 15, "keywords_count": len(LIGHT_COMMERCIAL_KEYWORDS)},
                "fleet": {"max_score": 20, "keywords_count": len(FLEET_KEYWORDS)},
                "transport_activity": {"max_score": 15},
                "construction": {"max_score": 10},
                "website": {"score": 10},
                "contact_info": {"score": 5},
            },
        }
