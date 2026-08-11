"""
CRM API endpoints: Customer CRUD, import, interactions, stats, duplicates.
"""
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.deps import PaginationParams, CustomerFilterParams
from app.modules.crm.service import CRMService
from app.modules.crm.import_service import import_from_file
from app.modules.crm.schemas import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    CustomerListResponse, InteractionCreate, InteractionResponse,
    ImportResult, CRMStats, DuplicateGroup,
    ContactCreate, ContactUpdate, ContactResponse,
)

router = APIRouter(prefix="/api/crm", tags=["CRM"])


@router.get("/customers", response_model=CustomerListResponse)
def list_customers(
    pagination: PaginationParams = Depends(),
    filters: CustomerFilterParams = Depends(),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Müşteri listesi — filtreleme ve sayfalama destekli."""
    return CRMService(db).get_customers(pagination, filters)


@router.get("/customers/map-markers", response_model=List[dict])
def get_map_markers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Harita üzerinde gösterilecek tüm müşteri koordinatlarını hafif biçimde döner."""
    return CRMService(db).get_map_markers()


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Müşteri detayı."""
    return CRMService(db).get_customer(customer_id)


@router.post("/customers", response_model=CustomerResponse)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yeni müşteri ekle."""
    return CRMService(db).create_customer(data)


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Müşteri güncelle."""
    return CRMService(db).update_customer(customer_id, data)


@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Müşteri sil (kalıcı)."""
    CRMService(db).delete_customer(customer_id)
    return {"message": "Müşteri silindi"}


@router.post("/customers/bulk-delete")
def bulk_delete(data: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Toplu müşteri silme."""
    ids = data.get("ids", [])
    if not ids:
        raise HTTPException(status_code=400, detail="Silinecek müşteri ID'leri gerekli")
    count = CRMService(db).bulk_delete_customers(ids)
    return {"message": f"{count} müşteri silindi", "deleted": count}


@router.delete("/customers/source/{source}")
def delete_by_source(source: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Belirli kaynaktan gelen tüm müşterileri sil."""
    count = CRMService(db).delete_by_source(source)
    return {"message": f"{count} müşteri silindi (kaynak: {source})", "deleted": count}


@router.post("/customers/import", response_model=ImportResult)
async def import_customers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Excel/CSV dosyasından müşteri aktar."""
    return await import_from_file(file, db, current_user.id)


@router.post("/customers/check-duplicate")
def check_duplicate(data: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Duplicate kontrolü yap."""
    return CRMService(db).check_duplicate(data)


@router.get("/customers/{customer_id}/interactions", response_model=List[InteractionResponse])
def list_interactions(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Müşteri etkileşim geçmişi."""
    return CRMService(db).get_interactions(customer_id)


@router.post("/customers/{customer_id}/interactions", response_model=InteractionResponse)
def create_interaction(customer_id: int, data: InteractionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yeni etkileşim ekle."""
    return CRMService(db).create_interaction(customer_id, data, current_user.id)


@router.get("/stats", response_model=CRMStats)
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """CRM istatistikleri."""
    return CRMService(db).get_stats()


@router.get("/nearby")
def get_nearby_customers(
    lat: float,
    lon: float,
    radius: float = 5000,
    segment: str = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Konum bazlı yakındaki müşterileri getirir (saha satışı için)."""
    return CRMService(db).get_nearby_customers(lat, lon, radius, segment)


@router.get("/route-search")
def route_search(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    threshold: float = 2000,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Güzergah boyunca yakınlıktaki müşterileri listeler."""
    return CRMService(db).get_route_along_customers(start_lat, start_lon, end_lat, end_lon, threshold)




@router.get("/duplicates", response_model=List[DuplicateGroup])
def find_duplicates(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Potansiyel duplicate müşterileri bul."""
    return CRMService(db).find_all_duplicates()


# ── Contact Endpoints ──────────────────────────────────────────────────

@router.get("/customers/{customer_id}/contacts", response_model=List[ContactResponse])
def list_contacts(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Firma irtibat kişileri listesi."""
    return CRMService(db).get_contacts(customer_id)


@router.post("/customers/{customer_id}/contacts", response_model=ContactResponse)
def add_contact(customer_id: int, data: ContactCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Firmaya yeni irtibat kişisi ekle."""
    return CRMService(db).add_contact(customer_id, data)


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, data: ContactUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """İrtibat kişisi güncelle."""
    return CRMService(db).update_contact(contact_id, data)


@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """İrtibat kişisi sil."""
    CRMService(db).delete_contact(contact_id)
    return {"message": "İrtibat kişisi silindi"}


@router.get("/contact-suggestions")
def get_contact_suggestions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Rehberden bulunan firma-kişi gruplarını getir."""
    import json, os
    report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'contact_groups.json')
    if not os.path.exists(report_path):
        return []
    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('groups', [])


@router.post("/customers/merge")
def merge_customers(data: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Birden fazla müşteri kaydını birleştir.
    primary_id: Ana firma kaydı (kalacak olan)
    secondary_ids: Birleştirilecek kayıtlar (kişi olarak taşınıp silinecek)
    """
    primary_id = data.get("primary_id")
    secondary_ids = data.get("secondary_ids", [])
    if not primary_id or not secondary_ids:
        raise HTTPException(status_code=400, detail="primary_id ve secondary_ids gerekli")
    result = CRMService(db).merge_customers(primary_id, secondary_ids)
    return result
