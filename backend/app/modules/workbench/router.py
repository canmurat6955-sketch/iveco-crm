"""
Çalışma Masası (Workbench) API:
  - Bugün Aranacaklar kuyruğu
  - Hızlı arama sonucu kaydı (tel: sonrası "Görüşme nasıl geçti?")
  - Telefona göre firma bulma
  - Telefonu eksik firmalar kuyruğu
  - Firma adı temizleme (öneri + onaylı uygulama)
  - Mükerrer kayıt grupları + güvenli birleştirme
Hiçbir veri otomatik değiştirilmez; tüm yazma işlemleri kullanıcı onayıyla yapılır.
"""
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session

from app.core.database import get_db, Base
from app.core.security import get_current_user
from app.modules.crm.models import Customer, CustomerReminder, CustomerContact, CustomerInteraction
from app.modules.crm.service import CRMService, TARGET_PROVINCES
from app.modules.sales_activity.models import SalesActivity
from app.modules.workbench.textclean import suggest_clean_name, name_key, phone_key

router = APIRouter(prefix="/api/work", tags=["Çalışma Masası"])

ACTIVE_STAGES = ["lead", "contact", "proposal", "negotiation"]


def _brief(c: Customer, reason: str, extra: Optional[dict] = None) -> dict:
    d = {
        "id": c.id,
        "company_name": c.company_name,
        "city": c.city,
        "district": c.district,
        "phone": c.phone,
        "sector": c.sector,
        "segment": c.segment,
        "pipeline_stage": c.pipeline_stage,
        "last_contact_date": str(c.last_contact_date) if c.last_contact_date else None,
        "priority_score": CRMService.calculate_priority_score(c),
        "reason": reason,
    }
    if extra:
        d.update(extra)
    return d


# ── Bugün Aranacaklar ──────────────────────────────────────────────

@router.get("/today")
def today_queue(
    new_limit: int = Query(15, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = date.today()
    seen = set()
    followups, stale, fresh = [], [], []

    # 1) Takip tarihi gelmiş/geçmiş aktiviteler (müşteri başına en yakın tarih)
    acts = (
        db.query(SalesActivity)
        .filter(SalesActivity.next_follow_up.isnot(None), SalesActivity.next_follow_up <= today,
                SalesActivity.status.notin_(["converted", "lost"]))
        .order_by(SalesActivity.next_follow_up)
        .all()
    )
    for a in acts:
        if a.customer_id in seen:
            continue
        # Bu takipten SONRA yeni bir aktivite girildiyse takip yapılmış sayılır
        newer = db.query(SalesActivity.id).filter(
            SalesActivity.customer_id == a.customer_id, SalesActivity.created_at > a.created_at
        ).first()
        if newer:
            continue
        c = db.get(Customer, a.customer_id)
        if not c or not c.is_active:
            continue
        seen.add(c.id)
        overdue = (today - a.next_follow_up).days
        followups.append(_brief(c, "Takip günü geldi" if overdue == 0 else f"Takip {overdue} gün gecikti",
                                {"due_date": str(a.next_follow_up), "note": a.notes}))

    # 1b) Hatırlatıcılar
    rems = (
        db.query(CustomerReminder)
        .filter(CustomerReminder.is_completed == False, func.date(CustomerReminder.reminder_date) <= today)
        .order_by(CustomerReminder.reminder_date)
        .all()
    )
    for r in rems:
        if r.customer_id in seen:
            continue
        c = db.get(Customer, r.customer_id)
        if not c or not c.is_active:
            continue
        seen.add(c.id)
        followups.append(_brief(c, f"Hatırlatıcı: {r.title or r.reminder_type or ''}".strip(),
                                {"due_date": str(r.reminder_date)[:10], "note": r.notes}))

    # 2) Aktif fırsatlar – 7 günden uzun süredir temas yok
    week_ago = today - timedelta(days=7)
    for c in (
        db.query(Customer)
        .filter(Customer.is_active == True, Customer.pipeline_stage.in_(ACTIVE_STAGES),
                or_(Customer.last_contact_date.is_(None), Customer.last_contact_date <= week_ago))
        .all()
    ):
        if c.id in seen:
            continue
        seen.add(c.id)
        days = (today - c.last_contact_date).days if c.last_contact_date else None
        stale.append(_brief(c, "Hiç görüşme kaydı yok" if days is None else f"{days} gündür temas yok"))
    stale.sort(key=lambda x: -x["priority_score"])

    # 3) Havuzdan yeni aranacaklar: telefonlu, hedef ilde, son 30 günde dokunulmamış, "ilgisiz" denmemiş
    month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    touched = {cid for (cid,) in db.query(SalesActivity.customer_id).filter(SalesActivity.created_at >= month_ago).distinct()}
    rejected = {cid for (cid,) in db.query(SalesActivity.customer_id).filter(SalesActivity.status == "lost").distinct()}
    if new_limit:
        cands = (
            db.query(Customer)
            .filter(Customer.is_active == True, Customer.pipeline_stage.is_(None),
                    Customer.phone.isnot(None), Customer.phone != "",
                    Customer.city.in_(TARGET_PROVINCES))
            .all()
        )
        scored = []
        for c in cands:
            if c.id in seen or c.id in touched or c.id in rejected or not phone_key(c.phone):
                continue
            scored.append(c)
        scored.sort(key=lambda c: (-CRMService.calculate_priority_score(c), {"A": 0, "B": 1, "C": 2, "D": 3}.get(c.segment or "C", 2), c.id))
        fresh = [_brief(c, "Yeni – hiç aranmamış") for c in scored[:new_limit]]

    done_today = db.query(func.count(SalesActivity.id)).filter(
        func.date(SalesActivity.created_at) == today.isoformat()
    ).scalar() or 0

    return {
        "date": str(today),
        "followups": followups,
        "stale_pipeline": stale,
        "new_calls": fresh,
        "done_today": done_today,
        "total": len(followups) + len(stale) + len(fresh),
    }


# ── Arama sonucu kaydı ─────────────────────────────────────────────

class CallOutcome(BaseModel):
    customer_id: int
    outcome: str  # no_answer | interested | not_interested | offer_given | call_back
    notes: Optional[str] = None
    next_follow_up: Optional[date] = None
    channel: str = "call"


OUTCOME_LABELS = {
    "no_answer": "Ulaşılamadı",
    "interested": "Görüşüldü – ilgileniyor",
    "not_interested": "Görüşüldü – ilgilenmiyor",
    "offer_given": "Teklif verildi",
    "call_back": "Tekrar aranacak",
}


@router.post("/call-outcome")
def log_call_outcome(data: CallOutcome, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = db.get(Customer, data.customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    if data.outcome not in OUTCOME_LABELS:
        raise HTTPException(status_code=400, detail="Geçersiz sonuç")

    today = date.today()
    follow = data.next_follow_up
    status = "sent"
    if data.outcome == "no_answer":
        status = "follow_up"
        follow = follow or (today + timedelta(days=1))
    elif data.outcome == "call_back":
        status = "follow_up"
        follow = follow or (today + timedelta(days=3))
    elif data.outcome == "interested":
        status = "replied"
        follow = follow or (today + timedelta(days=7))
        if c.pipeline_stage in (None, "lead", "lost"):
            c.pipeline_stage = "contact"
    elif data.outcome == "offer_given":
        status = "offer_given"
        follow = follow or (today + timedelta(days=3))
        if c.pipeline_stage not in ("negotiation", "won"):
            c.pipeline_stage = "proposal"
        c.potential_level = "very_high"
    elif data.outcome == "not_interested":
        status = "lost"
        follow = None

    label = OUTCOME_LABELS[data.outcome]
    note = label + (f" — {data.notes.strip()}" if data.notes and data.notes.strip() else "")
    act = SalesActivity(
        customer_id=c.id, user_id=current_user.id, activity_type=data.channel,
        status=status, notes=note, next_follow_up=follow,
    )
    db.add(act)
    db.add(CustomerInteraction(
        customer_id=c.id, user_id=current_user.id, interaction_type=data.channel,
        notes=note, next_action="Tekrar ara" if follow else None, next_action_date=follow,
    ))
    if data.outcome != "no_answer":
        c.last_contact_date = today
    if data.outcome in ("interested", "offer_given"):
        c.pipeline_note = note
    c.potential_score = CRMService.calculate_priority_score(c)
    db.commit()
    return {"ok": True, "activity_id": act.id, "pipeline_stage": c.pipeline_stage,
            "next_follow_up": str(follow) if follow else None, "label": label}


# ── Telefona göre firma bul ────────────────────────────────────────

@router.get("/lookup-phone")
def lookup_phone(phone: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    key = phone_key(phone)
    if not key:
        return []
    tail = key[-7:]
    found = {}
    for c in db.query(Customer).filter(Customer.is_active == True, Customer.phone.like(f"%{tail[-4:]}%")).all():
        if phone_key(c.phone) == key:
            found[c.id] = c
    for ct in db.query(CustomerContact).filter(CustomerContact.phone.like(f"%{tail[-4:]}%")).all():
        if phone_key(ct.phone) == key and ct.customer_id not in found:
            c = db.get(Customer, ct.customer_id)
            if c and c.is_active:
                found[c.id] = c
    return [{"id": c.id, "company_name": c.company_name, "city": c.city, "pipeline_stage": c.pipeline_stage}
            for c in found.values()]


# ── Telefonu eksik firmalar ────────────────────────────────────────

@router.get("/missing-phone")
def missing_phone(
    city: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Customer).filter(Customer.is_active == True, or_(Customer.phone.is_(None), Customer.phone == ""))
    if city and city != "all":
        q = q.filter(Customer.city.in_(TARGET_PROVINCES) if city == "target_9" else Customer.city == city)
    if search:
        q = q.filter(Customer.company_name.ilike(f"%{search}%"))
    total = q.count()
    by_city = dict(
        db.query(Customer.city, func.count(Customer.id))
        .filter(Customer.is_active == True, or_(Customer.phone.is_(None), Customer.phone == ""))
        .group_by(Customer.city).all()
    )
    rows = (
        q.order_by(Customer.segment.asc(), Customer.company_name.asc())
        .offset((page - 1) * page_size).limit(page_size).all()
    )
    return {
        "total": total,
        "by_city": {k or "Bilinmiyor": v for k, v in by_city.items()},
        "items": [{
            "id": c.id, "company_name": suggest_clean_name(c.company_name)[0], "full_name": c.company_name,
            "city": c.city, "district": c.district, "address": c.address, "sector": c.sector,
            "segment": c.segment, "website": c.website,
        } for c in rows],
    }


class PhoneSet(BaseModel):
    phone: str


@router.put("/customers/{customer_id}/phone")
def set_phone(customer_id: int, data: PhoneSet, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = db.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Firma bulunamadı")
    if not phone_key(data.phone):
        raise HTTPException(status_code=400, detail="Telefon 10 haneli olmalı (örn. 0362 123 45 67)")
    c.phone = data.phone.strip()
    c.potential_score = CRMService.calculate_priority_score(c)
    db.commit()
    return {"ok": True, "id": c.id, "phone": c.phone}


# ── Firma adı temizleme ────────────────────────────────────────────

@router.get("/name-cleanup")
def name_cleanup_suggestions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    out = []
    for c in db.query(Customer).filter(Customer.is_active == True).all():
        orig = " ".join((c.company_name or "").split())
        sug, removed = suggest_clean_name(orig)
        if sug and sug != orig:
            out.append({"id": c.id, "current": c.company_name, "suggested": sug, "removed": removed,
                        "city": c.city, "address": c.address})
    out.sort(key=lambda x: -len(x["current"]))
    return {"total": len(out), "items": out}


class NameFix(BaseModel):
    id: int
    new_name: str
    removed: Optional[str] = None


class NameFixBatch(BaseModel):
    items: List[NameFix]


@router.post("/name-cleanup/apply")
def apply_name_cleanup(data: NameFixBatch, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    n = 0
    for it in data.items:
        c = db.get(Customer, it.id)
        new = " ".join((it.new_name or "").split())
        if not c or len(new) < 2:
            continue
        old = c.company_name
        if new == old:
            continue
        c.company_name = new
        # Kesilen kısım kaybolmasın: notlara eski tam ad yazılır
        stamp = datetime.now().strftime("%d.%m.%Y")
        c.sales_notes = ((c.sales_notes or "") + f"\n[{stamp} ad düzeltme] Eski ad: {old}").strip()
        n += 1
    db.commit()
    return {"ok": True, "updated": n}


# ── Mükerrer kayıtlar ──────────────────────────────────────────────

def _customer_fk_columns():
    """customers.id'ye referans veren tüm (tablo, kolon) çiftleri."""
    out = []
    for t in Base.metadata.sorted_tables:
        if t.name == "customers":
            continue
        for col in t.columns:
            for fk in col.foreign_keys:
                if fk.column.table.name == "customers":
                    out.append((t.name, col.name))
    return out


def _activity_counts(db: Session, ids: List[int]) -> dict:
    if not ids:
        return {}
    return dict(db.query(SalesActivity.customer_id, func.count(SalesActivity.id))
                .filter(SalesActivity.customer_id.in_(ids)).group_by(SalesActivity.customer_id).all())


@router.get("/duplicates")
def duplicate_groups(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = db.query(Customer).filter(Customer.is_active == True).all()
    parent = {}

    def find(x):
        while parent.get(x, x) != x:
            parent[x] = parent.get(parent[x], parent[x])
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    reasons = defaultdict(set)
    by_name, by_phone = defaultdict(list), defaultdict(list)
    for c in rows:
        k = name_key(c.company_name)
        if len(k) >= 4:
            by_name[(k, c.city or "")].append(c.id)
        p = phone_key(c.phone)
        if p:
            by_phone[p].append(c.id)
    for g in by_name.values():
        for x in g[1:]:
            union(g[0], x)
            reasons[g[0]].add("Aynı ad")
    for g in by_phone.values():
        for x in g[1:]:
            union(g[0], x)
            reasons[g[0]].add("Aynı telefon")

    groups = defaultdict(list)
    cmap = {c.id: c for c in rows}
    for c in rows:
        groups[find(c.id)].append(c)
    multi = [g for g in groups.values() if len(g) > 1]
    all_ids = [c.id for g in multi for c in g]
    acts = _activity_counts(db, all_ids)

    out = []
    for g in multi:
        why = set()
        for c in g:
            why |= reasons.get(c.id, set())
        members = []
        for c in g:
            filled = sum(1 for v in (c.phone, c.address, c.tax_number, c.email, c.sector, c.district) if v)
            members.append({
                "id": c.id, "company_name": c.company_name, "city": c.city, "district": c.district,
                "phone": c.phone, "address": c.address, "tax_number": c.tax_number, "source": c.source,
                "pipeline_stage": c.pipeline_stage, "activity_count": acts.get(c.id, 0), "filled": filled,
            })
        # Önerilen ana kayıt: pipeline'da olan > aktivitesi çok olan > en dolu > en eski
        members.sort(key=lambda m: (m["pipeline_stage"] is None, -m["activity_count"], -m["filled"], m["id"]))
        out.append({"reason": " + ".join(sorted(why)) or "Benzer", "suggested_primary_id": members[0]["id"], "customers": members})
    out.sort(key=lambda g: g["customers"][0]["company_name"])
    return {"total_groups": len(out), "extra_records": sum(len(g["customers"]) - 1 for g in out), "groups": out}


class MergeRequest(BaseModel):
    primary_id: int
    secondary_ids: List[int]


@router.post("/duplicates/merge")
def merge_duplicates(data: MergeRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    primary = db.get(Customer, data.primary_id)
    if not primary:
        raise HTTPException(status_code=404, detail="Ana kayıt bulunamadı")
    sec_ids = [s for s in data.secondary_ids if s != data.primary_id]
    secs = [db.get(Customer, s) for s in sec_ids]
    secs = [s for s in secs if s]
    if not secs:
        raise HTTPException(status_code=400, detail="Birleştirilecek kayıt yok")

    stage_rank = {None: 0, "lost": 1, "lead": 2, "contact": 3, "proposal": 4, "negotiation": 5, "won": 6}
    notes = []
    for s in secs:
        for f in ("phone", "email", "website", "sector", "city", "district", "address", "tax_number",
                  "vergi_dairesi", "latitude", "longitude", "google_place_id", "google_maps_url",
                  "google_formatted_address", "current_fleet", "estimated_fleet_size"):
            if not getattr(primary, f) and getattr(s, f):
                setattr(primary, f, getattr(s, f))
        # Farklı telefon varsa kaybolmasın: irtibat kişisi olarak ekle
        if s.phone and phone_key(s.phone) and phone_key(s.phone) != phone_key(primary.phone):
            db.add(CustomerContact(customer_id=primary.id, contact_name=s.company_name[:200], phone=s.phone,
                                   notes=f"Birleştirmeden gelen numara (eski ID {s.id})", is_primary=False))
        if stage_rank.get(s.pipeline_stage, 0) > stage_rank.get(primary.pipeline_stage, 0):
            primary.pipeline_stage = s.pipeline_stage
            primary.pipeline_note = primary.pipeline_note or s.pipeline_note
        if s.last_contact_date and (not primary.last_contact_date or s.last_contact_date > primary.last_contact_date):
            primary.last_contact_date = s.last_contact_date
        if s.sales_notes:
            notes.append(f"[Birleşen #{s.id} {s.company_name}]: {s.sales_notes}")
    if notes:
        primary.sales_notes = ((primary.sales_notes or "") + "\n" + "\n".join(notes)).strip()
    db.flush()

    # Tüm bağlı kayıtları (aktivite, teklif, hatırlatıcı, filo, ek, arama...) ana kayda taşı
    moved = 0
    for table, col in _customer_fk_columns():
        for s in secs:
            res = db.execute(text(f'UPDATE "{table}" SET "{col}" = :p WHERE "{col}" = :s'), {"p": primary.id, "s": s.id})
            moved += res.rowcount or 0
    # Kişilerim'den dönüştürülmüş kayıt bağlantısı
    try:
        for s in secs:
            db.execute(text("UPDATE personal_contacts SET converted_customer_id = :p WHERE converted_customer_id = :s"),
                       {"p": primary.id, "s": s.id})
    except Exception:
        pass
    db.flush()
    for s in secs:
        db.expire(s)
        db.execute(text("DELETE FROM customers WHERE id = :s"), {"s": s.id})
    primary.potential_score = CRMService.calculate_priority_score(primary)
    db.commit()
    return {"ok": True, "primary_id": primary.id, "merged": len(secs), "moved_links": moved}


# ── Saha Satış Asistanı & Akıllı Fırsat Motoru ────────────────────────────

@router.get("/field-assistant")
def get_field_assistant(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Saha Satış Asistanı ve Akıllı Fırsat Motoru:
      - 30+ gündür ziyaret edilmeyen A/B müşterileri
      - Teklif / Proforma bekleyen müşteriler
      - Takip tarihi gelenler
      - Yüksek potansiyelli yeni keşifler
      - GPS yakınındaki ticari fırsatlar
    """
    import math
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    
    # 1. Ziyaret Edilmeyen A-Segment Müşteriler
    unvisited_a_query = db.query(Customer).filter(
        Customer.is_active == True,
        Customer.segment == "A",
        (Customer.last_contact_date.is_(None) | (Customer.last_contact_date <= thirty_days_ago))
    )
    if city and city not in ["Tümü", "all", "target_9"]:
        unvisited_a_query = unvisited_a_query.filter(Customer.city == city)
    
    unvisited_a_total = unvisited_a_query.count()
    unvisited_a_items = []
    for c in unvisited_a_query.order_by(Customer.potential_score.desc(), Customer.id.desc()).limit(10).all():
        days_ago = (today - c.last_contact_date).days if c.last_contact_date else None
        sec_text = (c.sector or "") + " " + (c.company_name or "")
        veh_opp = "Iveco Daily 70C18 Sac Damper / T-Way" if any(k in sec_text.lower() for k in ["hafriyat", "kazi", "kazı", "insaat", "inşaat", "maden", "tas", "taş"]) else ("Iveco Daily 35C16 / 50C18 Frigo" if any(k in sec_text.lower() for k in ["gida", "gıda", "frigo", "balik", "balık", "et", "sut", "süt"]) else "Iveco S-Way Çekici / Eurocargo")
        unvisited_a_items.append({
            "id": c.id,
            "company_name": c.company_name,
            "city": c.city,
            "district": c.district,
            "phone": c.phone,
            "sector": c.sector,
            "potential_score": c.potential_score or 92,
            "days_since_visit": days_ago,
            "vehicle_opportunity": veh_opp,
        })

    # 2. Teklif / Proforma Bekleyen Müşteriler
    proposals_query = db.query(Customer).filter(
        Customer.is_active == True,
        Customer.pipeline_stage.in_(["proposal", "negotiation"])
    )
    if city and city not in ["Tümü", "all", "target_9"]:
        proposals_query = proposals_query.filter(Customer.city == city)
    proposals_total = proposals_query.count()
    proposals_items = []
    for c in proposals_query.order_by(Customer.id.desc()).limit(10).all():
        proposals_items.append({
            "id": c.id,
            "company_name": c.company_name,
            "city": c.city,
            "district": c.district,
            "phone": c.phone,
            "stage": c.pipeline_stage,
            "note": c.pipeline_note or "Teklif & Şasi fiyatı bekleniyor",
            "potential_score": c.potential_score or 88
        })

    # 3. Takip Tarihi Gelen / Geçenler
    acts = (
        db.query(SalesActivity)
        .filter(SalesActivity.next_follow_up.isnot(None), SalesActivity.next_follow_up <= today,
                SalesActivity.status.notin_(["converted", "lost"]))
        .order_by(SalesActivity.next_follow_up)
        .limit(10)
        .all()
    )
    follow_ups_items = []
    for a in acts:
        c = db.get(Customer, a.customer_id)
        if c:
            follow_ups_items.append({
                "id": c.id,
                "company_name": c.company_name,
                "phone": c.phone,
                "city": c.city,
                "activity_type": a.activity_type,
                "follow_up_date": str(a.next_follow_up),
                "notes": a.notes
            })

    # 4. Yüksek Potansiyelli Yeni Keşifler (NACE + Google AI)
    from app.modules.discovery.models import NewCompanyRegistration
    new_disc_query = db.query(NewCompanyRegistration).filter(
        NewCompanyRegistration.status == "new"
    )
    if city and city not in ["Tümü", "all", "target_9"]:
        new_disc_query = new_disc_query.filter(NewCompanyRegistration.city == city)
    new_disc_total = new_disc_query.count()
    new_disc_items = []
    for d in new_disc_query.order_by(NewCompanyRegistration.id.desc()).limit(10).all():
        new_disc_items.append({
            "id": d.id,
            "company_name": d.company_name,
            "city": d.city,
            "district": d.district,
            "phone": d.phone,
            "nace_description": d.nace_description,
            "capital": d.capital,
            "source": "ticaret_sicil"
        })

    # 5. GPS Yakınlık Radarı (varsa)
    nearby_items = []
    if lat and lng:
        all_geo_custs = db.query(Customer).filter(
            Customer.is_active == True,
            Customer.latitude.isnot(None),
            Customer.longitude.isnot(None)
        ).all()
        for gc in all_geo_custs:
            d_lat = math.radians(gc.latitude - lat)
            d_lng = math.radians(gc.longitude - lng)
            a_val = math.sin(d_lat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(gc.latitude)) * math.sin(d_lng/2)**2
            c_val = 2 * math.atan2(math.sqrt(a_val), math.sqrt(1 - a_val))
            dist_km = 6371.0 * c_val
            if dist_km <= 5.0:
                nearby_items.append({
                    "id": gc.id,
                    "company_name": gc.company_name,
                    "distance_km": round(dist_km, 2),
                    "segment": gc.segment or "B",
                    "city": gc.city,
                    "phone": gc.phone,
                    "sector": gc.sector
                })
        nearby_items.sort(key=lambda x: x["distance_km"])

    return {
        "status": "ok",
        "city": city or "Samsun",
        "counts": {
            "unvisited_a": unvisited_a_total,
            "proposals_pending": proposals_total,
            "follow_ups_due": len(follow_ups_items),
            "new_discoveries": new_disc_total,
            "nearby_5km": len(nearby_items)
        },
        "unvisited_a": unvisited_a_items,
        "proposals_pending": proposals_items,
        "follow_ups": follow_ups_items,
        "new_discoveries": new_disc_items,
        "nearby": nearby_items[:8]
    }

