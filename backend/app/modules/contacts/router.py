"""
Kişilerim API: listeleme/arama, düzenleme, silme, firmaya dönüştürme.
"""
import math
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.contacts.models import PersonalContact

router = APIRouter(prefix="/api/contacts", tags=["Kişilerim"])


class PersonalContactOut(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    converted_customer_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PersonalContactList(BaseModel):
    items: List[PersonalContactOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class PersonalContactIn(BaseModel):
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    notes: Optional[str] = None


class PersonalContactUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    notes: Optional[str] = None


class ConvertRequest(BaseModel):
    company_name: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None


@router.get("", response_model=PersonalContactList)
def list_contacts(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(PersonalContact).filter(PersonalContact.converted_customer_id.is_(None))
    if search:
        s = f"%{search}%"
        digits = "".join(ch for ch in search if ch.isdigit())
        conds = [PersonalContact.full_name.ilike(s), PersonalContact.notes.ilike(s), PersonalContact.city.ilike(s)]
        if digits:
            conds.append(PersonalContact.phone.ilike(f"%{digits[-7:]}%"))
            conds.append(PersonalContact.phone.ilike(s))
        q = q.filter(or_(*conds))
    total = q.count()
    items = q.order_by(PersonalContact.full_name).offset((page - 1) * page_size).limit(page_size).all()
    return PersonalContactList(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.post("", response_model=PersonalContactOut)
def create_contact(data: PersonalContactIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = PersonalContact(**data.model_dump(), source="manual")
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{contact_id}", response_model=PersonalContactOut)
def update_contact(contact_id: int, data: PersonalContactUpdate, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user)):
    c = db.query(PersonalContact).get(contact_id)
    if not c:
        raise HTTPException(404, "Kişi bulunamadı")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = db.query(PersonalContact).get(contact_id)
    if not c:
        raise HTTPException(404, "Kişi bulunamadı")
    db.delete(c)
    db.commit()
    return {"ok": True}


@router.post("/{contact_id}/convert")
def convert_to_customer(contact_id: int, data: ConvertRequest, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user)):
    """Kişiyi firma (müşteri) kaydına dönüştürür. Pipeline'a otomatik eklenmez (havuza düşer)."""
    from app.modules.crm.models import Customer
    c = db.query(PersonalContact).get(contact_id)
    if not c:
        raise HTTPException(404, "Kişi bulunamadı")
    if c.converted_customer_id:
        return {"customer_id": c.converted_customer_id}
    cust = Customer(
        company_name=(data.company_name or c.full_name).strip(),
        phone=c.phone,
        city=data.city or c.city,
        district=c.district,
        sector=data.sector,
        source="kisilerim",
        pipeline_stage=None,
        sales_notes=f"Kişilerim listesinden firmaya dönüştürüldü. Kişi: {c.full_name}"
                    + (f" | {c.notes}" if c.notes else ""),
        potential_score=50,
        potential_level="medium",
        segment="C",
    )
    db.add(cust)
    db.flush()
    c.converted_customer_id = cust.id
    db.commit()
    return {"customer_id": cust.id}
