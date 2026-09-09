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
    OsbSearchRequest, OsbSearchResultItem,
    TenderCreate, TenderUpdate, TenderResponse,
    BodybuilderCreate, BodybuilderUpdate, BodybuilderResponse,
    ReferralCreate, ReferralUpdate, ReferralResponse,
    NewCompanyResponse,
)

router = APIRouter(prefix="/api/discovery", tags=["Firma Keşfi & Lead Radarı"])


# ── OSB & Sektörel Radar ──────────────────────────────────────────────────

@router.post("/radar/osb-search", response_model=List[OsbSearchResultItem])
def search_osb_radar(
    data: OsbSearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """OSB ve Sanayi Sitelerinde hedefli B2B sektörel radar araması yapar."""
    return DiscoveryService(db).search_osb_radar(data)


# ── Kamu & Belediye İhale Radarı ──────────────────────────────────────────

@router.get("/tenders", response_model=List[TenderResponse])
def list_tenders(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Hedef 9 ildeki aktif ve sonuçlanan kamu/belediye ihalelerini listeler."""
    return DiscoveryService(db).get_tenders(city)


@router.post("/tenders/scrape-live", response_model=List[TenderResponse])
def scrape_live_tenders(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """İlan.gov.tr üzerinden hedef 9 il için canlı kamu/belediye taşıma ve araç ihalelerini tarar."""
    return DiscoveryService(db).scrape_live_tenders(city)


@router.post("/tenders", response_model=TenderResponse)
def create_tender(data: TenderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yeni ihale kaydı ekler."""
    return DiscoveryService(db).create_tender(data)


@router.put("/tenders/{tender_id}", response_model=TenderResponse)
def update_tender(tender_id: int, data: TenderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """İhale kaydını günceller."""
    return DiscoveryService(db).update_tender(tender_id, data)


@router.delete("/tenders/{tender_id}")
def delete_tender(tender_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """İhale kaydını siler."""
    DiscoveryService(db).delete_tender(tender_id)
    return {"message": "İhale kaydı silindi"}


@router.post("/tenders/{tender_id}/convert-to-lead")
def convert_tender_contractor_to_lead(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """İhaleyi kazanan yükleniciyi tek tıkla CRM'e filo adayı olarak aktarır."""
    return DiscoveryService(db).convert_tender_to_lead(tender_id, current_user.id)


# ── Üst Yapıcı (Kasacı / Karoser) Partnerleri ──────────────────────────────

@router.get("/bodybuilders", response_model=List[BodybuilderResponse])
def list_bodybuilders(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Hedef 9 ildeki anlaşmalı üst yapıcı (kasacı/karoser) partnerlerini listeler."""
    return DiscoveryService(db).get_bodybuilders(city)


@router.post("/bodybuilders", response_model=BodybuilderResponse)
def create_bodybuilder(data: BodybuilderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yeni üst yapıcı partneri ekler."""
    return DiscoveryService(db).create_bodybuilder(data)


@router.put("/bodybuilders/{id}", response_model=BodybuilderResponse)
def update_bodybuilder(id: int, data: BodybuilderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Üst yapıcı bilgilerini günceller."""
    return DiscoveryService(db).update_bodybuilder(id, data)


@router.delete("/bodybuilders/{id}")
def delete_bodybuilder(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Üst yapıcıyı siler."""
    DiscoveryService(db).delete_bodybuilder(id)
    return {"message": "Üst yapıcı silindi"}


# ── Üst Yapıcı Müşteri Yönlendirmeleri (Referrals) ─────────────────────────

@router.get("/bodybuilders/referrals", response_model=List[ReferralResponse])
def list_referrals(
    bodybuilder_id: Optional[int] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Üst yapıcılardan gelen şasi ve müşteri taleplerini listeler."""
    return DiscoveryService(db).get_referrals(bodybuilder_id, city)


@router.post("/bodybuilders/referrals", response_model=ReferralResponse)
def create_referral(data: ReferralCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Üst yapıcıdan gelen yeni müşteri/şasi talebini kaydeder."""
    return DiscoveryService(db).create_referral(data)


@router.put("/bodybuilders/referrals/{id}", response_model=ReferralResponse)
def update_referral(id: int, data: ReferralUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yönlendirme durumunu günceller."""
    return DiscoveryService(db).update_referral(id, data)


@router.post("/bodybuilders/referrals/{id}/convert-to-lead")
def convert_referral_to_lead(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Üst yapıcı yönlendirmesini tek tıkla CRM'e satış adayı olarak aktarır."""
    return DiscoveryService(db).convert_referral_to_lead(id, current_user.id)


# ── Yeni Kurulan Şirketler (Ticaret Sicil / NACE) ──────────────────────────

@router.get("/new-registrations", response_model=List[NewCompanyResponse])
def list_new_registrations(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ticaret Sicil'de yeni tescil edilen lojistik ve toptancı şirketleri listeler."""
    return DiscoveryService(db).get_new_registrations(city)


@router.post("/new-registrations/{id}/convert-to-lead")
def convert_new_company_to_lead(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Yeni kurulan şirketi CRM'e aday müşteri olarak aktarır."""
    return DiscoveryService(db).convert_new_company_to_lead(id, current_user.id)


# ── Mevcut Kaynaklar & Firmalar ───────────────────────────────────────────

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

