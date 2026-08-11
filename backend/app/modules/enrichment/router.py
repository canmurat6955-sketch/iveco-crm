"""
Enrichment API endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.enrichment.service import EnrichmentService
from app.modules.discovery.schemas import DiscoveredCompanyResponse

router = APIRouter(prefix="/api/enrichment", tags=["Zenginleştirme"])


@router.get("/queue", response_model=List[DiscoveredCompanyResponse])
def get_queue(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Zenginleştirme kuyruğu."""
    return EnrichmentService(db).get_queue()


@router.post("/run/{company_id}")
def enrich_single(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Tek firma zenginleştir."""
    return EnrichmentService(db).enrich_company(company_id)


@router.post("/run-all")
def enrich_all(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Tüm bekleyen firmaları zenginleştir."""
    return EnrichmentService(db).batch_enrich()


@router.get("/config")
def get_config(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Scoring konfigürasyonu."""
    return EnrichmentService(db).get_config()
