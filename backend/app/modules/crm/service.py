"""
CRM service: Customer CRUD, filtering, pagination, duplicate detection.
"""
import math
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from fastapi import HTTPException, status
from fuzzywuzzy import fuzz
from urllib.parse import urlparse
from datetime import datetime, timedelta, timezone, date as date_type

from app.modules.crm.models import Customer, CustomerInteraction, CustomerContact
from app.modules.crm.schemas import (
    CustomerCreate, CustomerUpdate, CustomerListResponse,
    CustomerResponse, InteractionCreate, CRMStats, DuplicateGroup,
    ContactCreate, ContactUpdate, ContactResponse,
)
from app.core.deps import PaginationParams, CustomerFilterParams


class CRMService:
    def __init__(self, db: Session):
        self.db = db

    def get_customers(self, pagination: PaginationParams, filters: CustomerFilterParams) -> CustomerListResponse:
        query = self.db.query(Customer).filter(Customer.is_active == True)
        if filters.search:
            s = f"%{filters.search}%"
            query = query.filter(or_(
                Customer.company_name.ilike(s), Customer.phone.ilike(s),
                Customer.email.ilike(s), Customer.tax_number.ilike(s),
            ))
        if filters.city:
            query = query.filter(Customer.city == filters.city)
        if filters.sector:
            query = query.filter(Customer.sector.ilike(f"%{filters.sector}%"))
        if filters.segment:
            query = query.filter(Customer.segment == filters.segment)
        if filters.potential_level:
            query = query.filter(Customer.potential_level == filters.potential_level)
        if filters.source:
            query = query.filter(Customer.source == filters.source)
        if filters.assigned_to_id:
            query = query.filter(Customer.assigned_to_id == filters.assigned_to_id)

        total = query.count()
        sort_col = getattr(Customer, filters.sort_by, Customer.created_at)
        query = query.order_by(asc(sort_col) if filters.sort_order == "asc" else desc(sort_col))
        items = query.offset(pagination.offset).limit(pagination.page_size).all()

        res_items = []
        for c in items:
            c.priority_score = self.calculate_priority_score(c)
            res_items.append(CustomerResponse.model_validate(c))

        return CustomerListResponse(
            items=res_items,
            total=total, page=pagination.page, page_size=pagination.page_size,
            total_pages=math.ceil(total / pagination.page_size) if total > 0 else 1,
        )

    def get_customer(self, customer_id: int) -> Customer:
        c = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
        c.priority_score = self.calculate_priority_score(c)
        return c


    def create_customer(self, data: CustomerCreate, source: str = "manual") -> Customer:
        customer = Customer(**data.model_dump(), source=source)
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update_customer(self, customer_id: int, data: CustomerUpdate) -> Customer:
        customer = self.get_customer(customer_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(customer, field, value)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete_customer(self, customer_id: int):
        c = self.get_customer(customer_id)
        # Hard delete — permanently remove from DB
        self.db.query(CustomerInteraction).filter(CustomerInteraction.customer_id == customer_id).delete()
        self.db.delete(c)
        self.db.commit()

    def bulk_delete_customers(self, customer_ids: List[int]) -> int:
        """Toplu müşteri silme."""
        count = 0
        for cid in customer_ids:
            c = self.db.query(Customer).filter(Customer.id == cid).first()
            if c:
                self.db.query(CustomerInteraction).filter(CustomerInteraction.customer_id == cid).delete()
                self.db.delete(c)
                count += 1
        self.db.commit()
        return count

    def delete_by_source(self, source: str) -> int:
        """Belirli kaynaktan gelen tüm müşterileri sil."""
        customers = self.db.query(Customer).filter(Customer.source == source).all()
        count = len(customers)
        for c in customers:
            self.db.query(CustomerInteraction).filter(CustomerInteraction.customer_id == c.id).delete()
            self.db.delete(c)
        self.db.commit()
        return count

    def get_interactions(self, customer_id: int):
        self.get_customer(customer_id)
        return self.db.query(CustomerInteraction).filter(
            CustomerInteraction.customer_id == customer_id
        ).order_by(desc(CustomerInteraction.created_at)).all()

    def create_interaction(self, customer_id: int, data: InteractionCreate, user_id: int):
        self.get_customer(customer_id)
        interaction = CustomerInteraction(customer_id=customer_id, user_id=user_id, **data.model_dump())
        self.db.add(interaction)
        customer = self.get_customer(customer_id)
        customer.last_contact_date = date_type.today()
        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def get_stats(self) -> CRMStats:
        total = self.db.query(Customer).count()
        active = self.db.query(Customer).filter(Customer.is_active == True).count()
        seg = dict(self.db.query(Customer.segment, func.count(Customer.id)).filter(Customer.is_active == True).group_by(Customer.segment).all())
        pot = dict(self.db.query(Customer.potential_level, func.count(Customer.id)).filter(Customer.is_active == True).group_by(Customer.potential_level).all())
        city = dict(self.db.query(Customer.city, func.count(Customer.id)).filter(Customer.is_active == True, Customer.city.isnot(None)).group_by(Customer.city).order_by(desc(func.count(Customer.id))).limit(10).all())
        src = dict(self.db.query(Customer.source, func.count(Customer.id)).filter(Customer.is_active == True).group_by(Customer.source).all())
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent = self.db.query(CustomerInteraction).filter(CustomerInteraction.created_at >= week_ago).count()
        return CRMStats(total_customers=total, active_customers=active, by_segment=seg, by_potential=pot, by_city=city, by_source=src, recent_interactions=recent)

    def _normalize_phone(self, phone: str) -> str:
        if not phone: return ""
        return "".join(c for c in phone if c.isdigit())[-10:]

    def _extract_domain(self, url: str) -> str:
        if not url: return ""
        if not url.startswith("http"): url = "http://" + url
        try:
            parsed = urlparse(url)
            return (parsed.netloc or parsed.path).replace("www.", "").lower().strip()
        except: return ""

    def check_duplicate(self, data: CustomerCreate) -> list:
        matches = []
        customers = self.db.query(Customer).filter(Customer.is_active == True).all()
        for ex in customers:
            score = fuzz.token_sort_ratio(data.company_name.lower(), ex.company_name.lower())
            if score >= 85:
                matches.append({"match_type": "name", "match_score": score, "customer_id": ex.id, "customer_name": ex.company_name})
                continue
            if data.phone and ex.phone and self._normalize_phone(data.phone) == self._normalize_phone(ex.phone):
                matches.append({"match_type": "phone", "match_score": 100, "customer_id": ex.id, "customer_name": ex.company_name})
                continue
            if data.website and ex.website and self._extract_domain(data.website) == self._extract_domain(ex.website):
                matches.append({"match_type": "domain", "match_score": 100, "customer_id": ex.id, "customer_name": ex.company_name})
                continue
            if data.city and data.city == ex.city and data.district and data.district == ex.district:
                loc_score = fuzz.token_sort_ratio(data.company_name.lower(), ex.company_name.lower())
                if loc_score >= 70:
                    matches.append({"match_type": "location", "match_score": loc_score, "customer_id": ex.id, "customer_name": ex.company_name})
        return matches

    def find_all_duplicates(self):
        customers = self.db.query(Customer).filter(Customer.is_active == True).order_by(Customer.company_name).all()
        groups = []
        checked = set()
        for i, c1 in enumerate(customers):
            for c2 in customers[i+1:]:
                pair = tuple(sorted([c1.id, c2.id]))
                if pair in checked: continue
                score = fuzz.token_sort_ratio(c1.company_name.lower(), c2.company_name.lower())
                if score >= 80:
                    checked.add(pair)
                    groups.append(DuplicateGroup(match_type="name", match_score=score, customers=[CustomerResponse.model_validate(c1), CustomerResponse.model_validate(c2)]))
                elif c1.phone and c2.phone and self._normalize_phone(c1.phone) == self._normalize_phone(c2.phone):
                    checked.add(pair)
                    groups.append(DuplicateGroup(match_type="phone", match_score=100, customers=[CustomerResponse.model_validate(c1), CustomerResponse.model_validate(c2)]))
        return groups[:50]

    # ── Contact Methods ──────────────────────────────────────────────────

    def get_contacts(self, customer_id: int) -> List[ContactResponse]:
        """Firma irtibat kişileri."""
        self.get_customer(customer_id)  # 404 kontrolu
        contacts = self.db.query(CustomerContact).filter(
            CustomerContact.customer_id == customer_id
        ).order_by(CustomerContact.is_primary.desc(), CustomerContact.created_at).all()
        return [ContactResponse.model_validate(c) for c in contacts]

    def add_contact(self, customer_id: int, data: ContactCreate) -> CustomerContact:
        """Firmaya irtibat kişisi ekle."""
        self.get_customer(customer_id)  # 404 kontrolu
        contact = CustomerContact(customer_id=customer_id, **data.model_dump())
        self.db.add(contact)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def update_contact(self, contact_id: int, data: ContactUpdate) -> CustomerContact:
        """İrtibat kişisi güncelle."""
        contact = self.db.query(CustomerContact).filter(CustomerContact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="İrtibat kişisi bulunamadı")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(contact, field, value)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def delete_contact(self, contact_id: int):
        """İrtibat kişisi sil."""
        contact = self.db.query(CustomerContact).filter(CustomerContact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="İrtibat kişisi bulunamadı")
        self.db.delete(contact)
        self.db.commit()

    # ── Merge Method ──────────────────────────────────────────────────

    def merge_customers(self, primary_id: int, secondary_ids: List[int]) -> dict:
        """Birden fazla müşteri kaydını birleştir.
        Secondary müşteriler → primary'nin irtibat kişisi olur, sonra silinir.
        """
        primary = self.get_customer(primary_id)
        merged_contacts = []
        merged_notes = []

        for sec_id in secondary_ids:
            if sec_id == primary_id:
                continue
            sec = self.db.query(Customer).filter(Customer.id == sec_id).first()
            if not sec:
                continue

            # Secondary müşteriyi contact olarak ekle
            contact = CustomerContact(
                customer_id=primary_id,
                contact_name=sec.company_name,
                role=None,
                phone=sec.phone,
                email=sec.email,
                notes=f"Birleştirme ile taşındı (eski ID: {sec.id})",
                is_primary=False,
            )
            self.db.add(contact)
            merged_contacts.append(sec.company_name)

            # Secondary'nin mevcut contact'larını da primary'ye taşı
            for existing_contact in self.db.query(CustomerContact).filter(
                CustomerContact.customer_id == sec_id
            ).all():
                existing_contact.customer_id = primary_id
                merged_contacts.append(existing_contact.contact_name)

            # Secondary'nin etkileşim geçmişini primary'ye taşı
            for interaction in self.db.query(CustomerInteraction).filter(
                CustomerInteraction.customer_id == sec_id
            ).all():
                interaction.customer_id = primary_id

            # Primary'de eksik bilgileri secondary'den doldur
            if not primary.phone and sec.phone:
                primary.phone = sec.phone
            if not primary.email and sec.email:
                primary.email = sec.email
            if not primary.sector and sec.sector:
                primary.sector = sec.sector
            if not primary.city and sec.city:
                primary.city = sec.city
            if not primary.district and sec.district:
                primary.district = sec.district
            if not primary.address and sec.address:
                primary.address = sec.address
            if not primary.tax_number and sec.tax_number:
                primary.tax_number = sec.tax_number
            if not primary.website and sec.website:
                primary.website = sec.website

            # Notları birleştir
            if sec.sales_notes:
                merged_notes.append(f"[{sec.company_name}]: {sec.sales_notes}")

            # Secondary'yi sil
            self.db.delete(sec)

        # Notları ekle
        if merged_notes:
            existing_notes = primary.sales_notes or ""
            primary.sales_notes = (existing_notes + "\n--- Birleştirme ---\n" + "\n".join(merged_notes)).strip()

        self.db.commit()
        self.db.refresh(primary)

        return {
            "message": f"{len(merged_contacts)} kişi '{primary.company_name}' altına birleştirildi",
            "primary_id": primary.id,
            "primary_name": primary.company_name,
            "merged_contacts": merged_contacts,
            "total_merged": len(merged_contacts),
        }

    def get_nearby_customers(self, lat: float, lon: float, radius: float = 5000, segment: str = None) -> List[dict]:
        """GPS koordinatlarına göre yakındaki CRM müşterilerini listeler (Haversine formülü)."""
        from math import radians, cos, sin, asin, sqrt
        
        # Bounding box filtresi (SQL performansı için)
        lat_delta = radius / 111000.0
        lon_delta = radius / 83000.0
        
        query = self.db.query(Customer).filter(
            Customer.is_active == True,
            Customer.latitude.isnot(None),
            Customer.longitude.isnot(None),
            Customer.latitude.between(lat - lat_delta, lat + lat_delta),
            Customer.longitude.between(lon - lon_delta, lon + lon_delta)
        )
        
        if segment:
            query = query.filter(Customer.segment == segment)
            
        customers = query.all()
        results = []
        
        for c in customers:
            lon1, lat1, lon2, lat2 = map(radians, [lon, lat, c.longitude, c.latitude])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c_dist = 2 * asin(sqrt(a))
            r = 6371000  # Metre
            distance = c_dist * r
            
            if distance <= radius:
                # Dinamik priority score hesapla
                p_score = self.calculate_priority_score(c)
                results.append({
                    "id": c.id,
                    "company_name": c.company_name,
                    "phone": c.phone,
                    "city": c.city,
                    "district": c.district,
                    "address": c.address,
                    "segment": c.segment,
                    "potential_level": c.potential_level,
                    "potential_score": c.potential_score,
                    "latitude": c.latitude,
                    "longitude": c.longitude,
                    "distance": distance,
                    "last_contact_date": str(c.last_contact_date) if c.last_contact_date else None,
                    "priority_score": p_score
                })
                
        results.sort(key=lambda x: x["distance"])
        return results

    @staticmethod
    def calculate_priority_score(c: Customer) -> int:
        """Müşterinin dinamik satış öncelik skorunu hesaplar (0 - 100)."""
        from datetime import date
        score = 0
        
        # 1. Segment Puanı (Max 40)
        seg = c.segment or "C"
        if seg == "A":
            score += 40
        elif seg == "B":
            score += 30
        elif seg == "C":
            score += 15
        elif seg == "D":
            score += 5
            
        # 2. Ziyaret Geçerliliği (Max 30)
        if not c.last_contact_date:
            score += 30
        else:
            days_ago = (date.today() - c.last_contact_date).days
            if days_ago > 90:
                score += 30
            elif days_ago > 60:
                score += 20
            elif days_ago > 30:
                score += 10
                
        # 3. Fırsat Durumu (Max 30)
        stage = c.pipeline_stage or "lead"
        if stage in ["proposal", "negotiation"]:
            score += 30
        elif stage == "contact":
            score += 15
        elif stage == "lead":
            score += 5
            
        return score

    def get_route_along_customers(
        self, start_lat: float, start_lon: float, end_lat: float, end_lon: float, threshold: float = 2000
    ) -> List[dict]:
        """Başlangıç ve bitiş noktaları arasındaki güzergah boyunca yakınlıktaki müşterileri listeler."""
        # 1. Bounding box filtrelemesi
        min_lat = min(start_lat, end_lat) - (threshold / 111000.0)
        max_lat = max(start_lat, end_lat) + (threshold / 111000.0)
        min_lon = min(start_lon, end_lon) - (threshold / 83000.0)
        max_lon = max(start_lon, end_lon) + (threshold / 83000.0)

        query = self.db.query(Customer).filter(
            Customer.is_active == True,
            Customer.latitude.isnot(None),
            Customer.longitude.isnot(None),
            Customer.latitude.between(min_lat, max_lat),
            Customer.longitude.between(min_lon, max_lon)
        )
        candidates = query.all()
        results = []

        ax, ay = start_lon, start_lat
        bx, by = end_lon, end_lat
        
        dx = bx - ax
        dy = by - ay
        
        line_len_sq = dx*dx + dy*dy
        if line_len_sq == 0:
            return self.get_nearby_customers(start_lat, start_lon, threshold)

        from math import radians, cos, sin, asin, sqrt
        
        for c in candidates:
            px, py = c.longitude, c.latitude
            
            t = ((px - ax) * dx + (py - ay) * dy) / line_len_sq
            t = max(0.0, min(1.0, t))
            
            proj_x = ax + t * dx
            proj_y = ay + t * dy
            
            lon1, lat1, lon2, lat2 = map(radians, [px, py, proj_x, proj_y])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c_dist = 2 * asin(sqrt(a))
            distance = c_dist * 6371000 # Metre
            
            if distance <= threshold:
                results.append({
                    "id": c.id,
                    "company_name": c.company_name,
                    "phone": c.phone,
                    "city": c.city,
                    "district": c.district,
                    "segment": c.segment,
                    "potential_level": c.potential_level,
                    "latitude": c.latitude,
                    "longitude": c.longitude,
                    "distance_to_route": distance,
                    "priority_score": self.calculate_priority_score(c)
                })
                
        results.sort(key=lambda x: x["distance_to_route"])
        return results



