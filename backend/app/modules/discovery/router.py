"""
Discovery API endpoints.
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.schemas import (
    SourceCreate, SourceUpdate, SourceResponse,
    DiscoveredCompanyResponse, DiscoveredCompanyList, DiscoveryStats,
)

router = APIRouter(prefix="/api/discovery", tags=["Firma Keşfi"])


@router.get("/sources", response_model=List[SourceResponse])
def list_sources(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DiscoveryService(db).get_sources()


@router.post("/sources", response_model=SourceResponse)
def create_source(data: SourceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DiscoveryService(db).create_source(data)


@router.put("/sources/{source_id}", response_model=SourceResponse)
def update_source(source_id: int, data: SourceUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DiscoveryService(db).update_source(source_id, data)


@router.post("/sources/{source_id}/run")
def run_source(source_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Manuel tarama başlat."""
    return DiscoveryService(db).run_source(source_id)


@router.get("/companies", response_model=DiscoveredCompanyList)
def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return DiscoveryService(db).get_companies(page, page_size, status, city)


@router.get("/companies/{company_id}", response_model=DiscoveredCompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DiscoveryService(db).get_company(company_id)


@router.post("/companies/{company_id}/convert")
def convert_to_customer(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Keşfedilen firmayı CRM'e aktar."""
    return DiscoveryService(db).convert_to_customer(company_id, current_user.id)


@router.post("/companies/{company_id}/reject")
def reject_company(company_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Firmayı reddet."""
    return DiscoveryService(db).reject_company(company_id)


@router.get("/stats", response_model=DiscoveryStats)
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DiscoveryService(db).get_stats()
