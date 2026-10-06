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

from app.modules.crm.models import (
    Customer, CustomerInteraction, CustomerContact, ProformaInvoice,
    Vehicle, CustomerFleetVehicle, CustomerReminder, CustomerTradeIn, CustomerAttachment
)
from app.modules.crm.schemas import (
    CustomerCreate, CustomerUpdate, CustomerListResponse,
    CustomerResponse, InteractionCreate, CRMStats, DuplicateGroup,
    ContactCreate, ContactUpdate, ContactResponse,
    ProformaCreate, ProformaUpdate, ProformaResponse,
    FleetVehicleCreate, FleetVehicleUpdate, FleetVehicleResponse,
    ReminderCreate, ReminderUpdate, ReminderResponse,
    TradeInCreate, TradeInUpdate, TradeInResponse,
    AttachmentResponse, NearbyCustomerResponse
)
from app.core.deps import PaginationParams, CustomerFilterParams


TARGET_PROVINCES = [
    "Samsun", "Ordu", "Sivas", "Giresun", "Çorum", "Amasya", "Sinop", "Tokat", "Kastamonu"
]


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
            if filters.city in ["target_9", "Hedef 9 İl", "9_il"]:
                query = query.filter(or_(Customer.city.in_(TARGET_PROVINCES), Customer.pipeline_stage.in_(["proposal", "negotiation", "won", "contact"])))
            elif filters.city in ["all", "Tüm İller", "Tümü"]:
                pass
            elif filters.city == "Bilinmiyor":
                query = query.filter(or_(Customer.city == "Bilinmiyor", Customer.city.is_(None)))
            else:
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
        if filters.pipeline_stage:
            if filters.pipeline_stage in ["active", "pipeline", "in_pipeline"]:
                # Only customers with active pipeline stages (not empty/null, and not pool)
                query = query.filter(
                    Customer.pipeline_stage.isnot(None),
                    Customer.pipeline_stage != "",
                    Customer.pipeline_stage != "pool"
                )
            elif filters.pipeline_stage in ["pool", "unassigned", "havuz"]:
                query = query.filter(or_(
                    Customer.pipeline_stage.is_(None),
                    Customer.pipeline_stage == "",
                    Customer.pipeline_stage == "pool"
                ))
            else:
                query = query.filter(Customer.pipeline_stage == filters.pipeline_stage)

        # Araç Odaklı Satış Zekâsı Filtreleri
        if filters.vehicle_group or filters.model_code or filters.interest_level or filters.purchase_timeframe:
            from app.modules.vehicles.models import CustomerVehicleInterest, VehicleMaster
            query = query.join(CustomerVehicleInterest, Customer.id == CustomerVehicleInterest.customer_id)
            if filters.vehicle_group or filters.model_code:
                query = query.join(VehicleMaster, CustomerVehicleInterest.vehicle_id == VehicleMaster.id)
                if filters.vehicle_group:
                    query = query.filter(VehicleMaster.vehicle_group == filters.vehicle_group)
                if filters.model_code:
                    query = query.filter(VehicleMaster.model_code.ilike(f"%{filters.model_code}%"))
            if filters.interest_level:
                query = query.filter(CustomerVehicleInterest.interest_level == filters.interest_level)
            if filters.purchase_timeframe:
                query = query.filter(CustomerVehicleInterest.purchase_timeframe == filters.purchase_timeframe)
            query = query.distinct()

        total = query.count()
        sort_col = getattr(Customer, filters.sort_by, Customer.created_at)
        from sqlalchemy import case
        stage_priority = case(
            (Customer.pipeline_stage.in_(["proposal", "negotiation", "won"]), 0),
            (Customer.pipeline_stage == "contact", 1),
            else_=2
        )
        query = query.order_by(stage_priority, asc(sort_col) if filters.sort_order == "asc" else desc(sort_col))
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

    def get_map_markers(self) -> List[dict]:
        customers = self.db.query(Customer).filter(
            Customer.is_active == True,
            Customer.latitude.isnot(None),
            Customer.longitude.isnot(None),
        ).all()
        return [
            {
                "id": c.id,
                "company_name": c.company_name,
                "latitude": str(c.latitude),
                "longitude": str(c.longitude),
                "city": c.city,
                "sector": c.sector
            }
            for c in customers
        ]

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
        """
        Müşterinin dinamik satış öncelik skoru (0 - 100).
        Mantık: "Bugün bu firmayı aramam ne kadar mantıklı?"
          - Ulaşılabilirlik (telefon var mı)      max 25
          - Hedef 9 ilde mi                       max 15
          - Segment                               max 20
          - Pipeline aşaması                      max 25
          - Takip gecikmesi                       max 15
        """
        from datetime import date
        score = 0

        # 1. Ulaşılabilirlik: telefonu olmayan firma aranamaz
        if c.phone and c.phone.strip():
            score += 25

        # 2. Yetki bölgesi
        if c.city in TARGET_PROVINCES:
            score += 15

        # 3. Segment
        score += {"A": 20, "B": 15, "C": 8, "D": 3}.get(c.segment or "C", 8)

        # 4. Fırsat durumu (havuz = 0)
        stage = c.pipeline_stage
        if stage in ("proposal", "negotiation"):
            score += 25
        elif stage == "contact":
            score += 15
        elif stage == "lead":
            score += 10

        # 5. Takip gecikmesi: aktif fırsatta uzun süredir temas yoksa öne çıkar
        days_ago = (date.today() - c.last_contact_date).days if c.last_contact_date else None
        if stage in ("lead", "contact", "proposal", "negotiation"):
            if days_ago is None or days_ago > 14:
                score += 15
            elif days_ago > 7:
                score += 8
        elif not stage and days_ago is None:
            score += 5  # havuzda, hiç aranmamış

        if stage in ("won", "lost"):
            score = min(score, 30)

        return min(score, 100)

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

    def number_to_turkish_words(self, n: float) -> str:
        n = round(n, 2)
        integer_part = int(n)
        decimal_part = int(round((n - integer_part) * 100))

        ones = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"]
        tens = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"]
        hundreds = ["", "yüz", "ikiyüz", "üçyüz", "dörtyüz", "beşyüz", "altıyüz", "yediyüz", "sekizyüz", "dokuzyüz"]
        
        def convert_group(num: int) -> str:
            h = num // 100
            t = (num % 100) // 10
            o = num % 10
            
            res = ""
            if h > 0:
                res += hundreds[h]
            if t > 0:
                res += tens[t]
            if o > 0:
                res += ones[o]
            return res

        if integer_part == 0:
            int_str = "sıfır"
        else:
            groups = []
            temp = integer_part
            while temp > 0:
                groups.append(temp % 1000)
                temp //= 1000
                
            group_names = ["", "bin", "milyon", "milyar", "trilyon"]
            parts = []
            for i, val in enumerate(groups):
                if val == 0:
                    continue
                grp_str = convert_group(val)
                if i == 1 and val == 1:
                    grp_str = ""
                parts.append(grp_str + group_names[i])
            
            parts.reverse()
            int_str = "".join(parts)

        dec_str = ""
        if decimal_part > 0:
            t = decimal_part // 10
            o = decimal_part % 10
            dec_words = tens[t] + ones[o]
            dec_str = f" {dec_words} Kr."

        result = f"Yalnız {int_str} TL"
        if decimal_part > 0:
            result = f"Yalnız {int_str} TL{dec_str}"
        
        words = result.split()
        if len(words) >= 2:
            words[1] = words[1].capitalize()
            result = " ".join(words)
            
        return result

    def calculate_proforma_prices(self, unit_price: float, otv_rate: float, kdv_rate: float) -> dict:
        otv_amount = round(unit_price * (otv_rate / 100.0), 2)
        subtotal = round(unit_price + otv_amount, 2)
        kdv_amount = round(subtotal * (kdv_rate / 100.0), 2)
        grand_total = round(subtotal + kdv_amount, 2)
        return {
            "otv_amount": otv_amount,
            "subtotal": subtotal,
            "kdv_amount": kdv_amount,
            "grand_total": grand_total
        }

    def create_proforma(self, customer_id: int, data: ProformaCreate, user_id: int) -> ProformaInvoice:
        customer = self.db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == True).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")
            
        p_date = data.date or date_type.today()
        current_year = p_date.year
        year_start = date_type(current_year, 1, 1)
        year_end = date_type(current_year, 12, 31)
        count = self.db.query(ProformaInvoice).filter(
            ProformaInvoice.date >= year_start,
            ProformaInvoice.date <= year_end
        ).count()
        invoice_number = f"ERC-{current_year}-{count+1:04d}"
        
        prices = self.calculate_proforma_prices(data.unit_price, data.otv_rate, data.kdv_rate)
        grand_total_words = self.number_to_turkish_words(prices["grand_total"])
        
        db_proforma = ProformaInvoice(
            customer_id=customer_id,
            created_by_id=user_id,
            invoice_number=invoice_number,
            date=p_date,
            validity_date=data.validity_date,
            vehicle_model=data.vehicle_model,
            model_year=data.model_year,
            chassis_no=data.chassis_no,
            motor_no=data.motor_no,
            motor_power=data.motor_power,
            color=data.color,
            max_weight=data.max_weight,
            unit_price=data.unit_price,
            otv_rate=data.otv_rate,
            otv_amount=prices["otv_amount"],
            subtotal=prices["subtotal"],
            kdv_rate=data.kdv_rate,
            kdv_amount=prices["kdv_amount"],
            grand_total=prices["grand_total"],
            grand_total_words=grand_total_words,
            delivery_place=data.delivery_place,
            payment_terms=data.payment_terms,
            notes=data.notes
        )
        
        # Müşterinin Pipeline aşamasını otomatik olarak Teklif (proposal) durumuna geçir
        customer.pipeline_stage = "proposal"
        customer.pipeline_note = f"Resmi Proforma Fatura Düzenlendi ({invoice_number})"

        self.db.add(db_proforma)
        self.db.commit()
        self.db.refresh(db_proforma)
        return db_proforma

    def get_proforma(self, proforma_id: int) -> ProformaInvoice:
        proforma = self.db.query(ProformaInvoice).filter(ProformaInvoice.id == proforma_id).first()
        if not proforma:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proforma fatura bulunamadı")
        return proforma

    def list_customer_proformas(self, customer_id: int) -> List[ProformaInvoice]:
        return self.db.query(ProformaInvoice).filter(
            ProformaInvoice.customer_id == customer_id
        ).order_by(desc(ProformaInvoice.created_at)).all()

    def update_proforma(self, proforma_id: int, data: ProformaUpdate) -> ProformaInvoice:
        proforma = self.db.query(ProformaInvoice).filter(ProformaInvoice.id == proforma_id).first()
        if not proforma:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proforma fatura bulunamadı")
            
        update_data = data.model_dump(exclude_unset=True)
        
        unit_price = update_data.get("unit_price", proforma.unit_price)
        otv_rate = update_data.get("otv_rate", proforma.otv_rate)
        kdv_rate = update_data.get("kdv_rate", proforma.kdv_rate)
        
        if "unit_price" in update_data or "otv_rate" in update_data or "kdv_rate" in update_data:
            prices = self.calculate_proforma_prices(unit_price, otv_rate, kdv_rate)
            update_data["otv_amount"] = prices["otv_amount"]
            update_data["subtotal"] = prices["subtotal"]
            update_data["kdv_amount"] = prices["kdv_amount"]
            update_data["grand_total"] = prices["grand_total"]
            update_data["grand_total_words"] = self.number_to_turkish_words(prices["grand_total"])
            
        for key, value in update_data.items():
            setattr(proforma, key, value)
            
        self.db.commit()
        self.db.refresh(proforma)
        return proforma

    def delete_proforma(self, proforma_id: int):
        proforma = self.db.query(ProformaInvoice).filter(ProformaInvoice.id == proforma_id).first()
        if not proforma:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proforma fatura bulunamadı")
        self.db.delete(proforma)
        self.db.commit()

    def search_vehicles(self, query: str = "") -> List[Vehicle]:
        q = self.db.query(Vehicle)
        if query:
            q = q.filter(Vehicle.model_name.ilike(f"%{query}%"))
        return q.limit(30).all()


    # ── Fleet Vehicle Methods ──────────────────────────────────────────

    def get_fleet(self, customer_id: int) -> List[FleetVehicleResponse]:
        vehicles = self.db.query(CustomerFleetVehicle).filter(
            CustomerFleetVehicle.customer_id == customer_id
        ).order_by(CustomerFleetVehicle.id.desc()).all()
        
        current_year = datetime.now(timezone.utc).year
        result = []
        for v in vehicles:
            age = (current_year - v.model_year) if v.model_year else None
            is_due = (age is not None and age >= 3) or (v.estimated_replacement_year is not None and v.estimated_replacement_year <= current_year)
            
            resp = FleetVehicleResponse(
                id=v.id,
                customer_id=v.customer_id,
                brand=v.brand,
                model=v.model,
                model_year=v.model_year,
                plate_number=v.plate_number,
                body_type=v.body_type,
                fuel_type=v.fuel_type,
                estimated_replacement_year=v.estimated_replacement_year,
                mileage=v.mileage,
                notes=v.notes,
                created_at=v.created_at,
                updated_at=v.updated_at,
                vehicle_age=age,
                is_renewal_due=is_due
            )
            result.append(resp)
        return result

    def add_fleet_vehicle(self, customer_id: int, data: FleetVehicleCreate) -> CustomerFleetVehicle:
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")
            
        vehicle = CustomerFleetVehicle(
            customer_id=customer_id,
            brand=data.brand,
            model=data.model,
            model_year=data.model_year,
            plate_number=data.plate_number,
            body_type=data.body_type,
            fuel_type=data.fuel_type or "Dizel",
            estimated_replacement_year=data.estimated_replacement_year,
            mileage=data.mileage,
            notes=data.notes
        )
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        
        fleet_count = self.db.query(CustomerFleetVehicle).filter(CustomerFleetVehicle.customer_id == customer_id).count()
        customer.estimated_fleet_size = fleet_count
        self.db.commit()
        
        return vehicle

    def update_fleet_vehicle(self, vehicle_id: int, data: FleetVehicleUpdate) -> CustomerFleetVehicle:
        vehicle = self.db.query(CustomerFleetVehicle).filter(CustomerFleetVehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filo aracı bulunamadı")
            
        update_data = data.model_dump(exclude_unset=True)
        for k, val in update_data.items():
            setattr(vehicle, k, val)
            
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete_fleet_vehicle(self, vehicle_id: int):
        vehicle = self.db.query(CustomerFleetVehicle).filter(CustomerFleetVehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filo aracı bulunamadı")
        cust_id = vehicle.customer_id
        self.db.delete(vehicle)
        self.db.commit()
        
        customer = self.db.query(Customer).filter(Customer.id == cust_id).first()
        if customer:
            customer.estimated_fleet_size = self.db.query(CustomerFleetVehicle).filter(CustomerFleetVehicle.customer_id == cust_id).count()
            self.db.commit()

    def get_fleet_renewal_opportunities(self) -> List[dict]:
        current_year = datetime.now(timezone.utc).year
        cutoff_year = current_year - 3
        
        vehicles = self.db.query(CustomerFleetVehicle).join(Customer).filter(
            Customer.is_active == True,
            or_(
                CustomerFleetVehicle.model_year <= cutoff_year,
                CustomerFleetVehicle.estimated_replacement_year <= current_year
            )
        ).order_by(CustomerFleetVehicle.model_year.asc()).all()
        
        opportunities = []
        for v in vehicles:
            age = (current_year - v.model_year) if v.model_year else None
            opportunities.append({
                "vehicle_id": v.id,
                "customer_id": v.customer_id,
                "company_name": v.customer.company_name,
                "customer_phone": v.customer.phone,
                "city": v.customer.city,
                "district": v.customer.district,
                "brand": v.brand,
                "model": v.model,
                "model_year": v.model_year,
                "plate_number": v.plate_number,
                "body_type": v.body_type,
                "vehicle_age": age,
                "is_renewal_due": True,
                "notes": v.notes
            })
        return opportunities


    # ── Reminder Methods ────────────────────────────────────────────────

    def get_reminders(self, customer_id: int) -> List[CustomerReminder]:
        return self.db.query(CustomerReminder).filter(
            CustomerReminder.customer_id == customer_id
        ).order_by(CustomerReminder.is_completed.asc(), CustomerReminder.reminder_date.asc()).all()

    def add_reminder(self, customer_id: int, user_id: Optional[int], data: ReminderCreate) -> CustomerReminder:
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")
            
        reminder = CustomerReminder(
            customer_id=customer_id,
            user_id=user_id,
            reminder_date=data.reminder_date,
            reminder_type=data.reminder_type,
            title=data.title,
            notes=data.notes,
            is_completed=False
        )
        self.db.add(reminder)
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def update_reminder(self, reminder_id: int, data: ReminderUpdate) -> CustomerReminder:
        reminder = self.db.query(CustomerReminder).filter(CustomerReminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hatırlatıcı bulunamadı")
            
        update_data = data.model_dump(exclude_unset=True)
        if "is_completed" in update_data:
            if update_data["is_completed"]:
                reminder.completed_at = datetime.now(timezone.utc)
            else:
                reminder.completed_at = None
                
        for k, val in update_data.items():
            setattr(reminder, k, val)
            
        self.db.commit()
        self.db.refresh(reminder)
        return reminder

    def delete_reminder(self, reminder_id: int):
        reminder = self.db.query(CustomerReminder).filter(CustomerReminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hatırlatıcı bulunamadı")
        self.db.delete(reminder)
        self.db.commit()

    def get_upcoming_reminders(self, days_ahead: int = 14) -> List[dict]:
        today = date_type.today()
        end_date = today + timedelta(days=days_ahead)
        
        reminders = self.db.query(CustomerReminder).join(Customer).filter(
            Customer.is_active == True,
            CustomerReminder.is_completed == False,
            CustomerReminder.reminder_date <= end_date
        ).order_by(CustomerReminder.reminder_date.asc()).all()
        
        result = []
        for r in reminders:
            result.append({
                "id": r.id,
                "customer_id": r.customer_id,
                "company_name": r.customer.company_name,
                "customer_phone": r.customer.phone,
                "city": r.customer.city,
                "district": r.customer.district,
                "reminder_date": r.reminder_date,
                "reminder_type": r.reminder_type,
                "title": r.title,
                "notes": r.notes,
                "is_completed": r.is_completed,
                "created_at": r.created_at,
                "is_overdue": r.reminder_date < today
            })
        return result

    # ── Trade-In (Takas / 2. El Değerlendirme) ──
    def get_customer_trade_ins(self, customer_id: int) -> List[CustomerTradeIn]:
        return self.db.query(CustomerTradeIn).filter(
            CustomerTradeIn.customer_id == customer_id
        ).order_by(CustomerTradeIn.created_at.desc()).all()

    def create_customer_trade_in(self, customer_id: int, data: TradeInCreate, user_id: Optional[int] = None) -> CustomerTradeIn:
        customer = self.db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == True).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")

        trade_in = CustomerTradeIn(
            customer_id=customer_id,
            user_id=user_id,
            vehicle_brand=data.vehicle_brand,
            vehicle_model=data.vehicle_model,
            model_year=data.model_year,
            mileage_km=data.mileage_km,
            plate_number=data.plate_number,
            body_type=data.body_type,
            condition_notes=data.condition_notes,
            customer_expected_price=data.customer_expected_price,
            appraised_value=data.appraised_value,
            currency=data.currency or "TL",
            status=data.status or "pending"
        )
        self.db.add(trade_in)
        self.db.commit()
        self.db.refresh(trade_in)
        return trade_in

    def update_trade_in(self, trade_in_id: int, data: TradeInUpdate) -> CustomerTradeIn:
        trade_in = self.db.query(CustomerTradeIn).filter(CustomerTradeIn.id == trade_in_id).first()
        if not trade_in:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Takas kaydı bulunamadı")

        update_data = data.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(trade_in, key, val)

        trade_in.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(trade_in)
        return trade_in

    def delete_trade_in(self, trade_in_id: int):
        trade_in = self.db.query(CustomerTradeIn).filter(CustomerTradeIn.id == trade_in_id).first()
        if not trade_in:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Takas kaydı bulunamadı")
        self.db.delete(trade_in)
        self.db.commit()

    # ── Customer Attachments (Fotoğraflar ve Evraklar) ──
    def get_customer_attachments(self, customer_id: int, category: Optional[str] = None) -> List[CustomerAttachment]:
        query = self.db.query(CustomerAttachment).filter(CustomerAttachment.customer_id == customer_id)
        if category:
            query = query.filter(CustomerAttachment.category == category)
        return query.order_by(CustomerAttachment.created_at.desc()).all()

    def create_customer_attachment(
        self,
        customer_id: int,
        file_url: str,
        file_name: str,
        file_type: Optional[str] = None,
        file_size: Optional[int] = None,
        category: str = "general",
        title: Optional[str] = None,
        fleet_id: Optional[int] = None,
        trade_in_id: Optional[int] = None,
        user_id: Optional[int] = None
    ) -> CustomerAttachment:
        customer = self.db.query(Customer).filter(Customer.id == customer_id, Customer.is_active == True).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")

        attachment = CustomerAttachment(
            customer_id=customer_id,
            fleet_id=fleet_id,
            trade_in_id=trade_in_id,
            user_id=user_id,
            file_url=file_url,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size,
            category=category,
            title=title or file_name
        )
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment

    def delete_attachment(self, attachment_id: int):
        attachment = self.db.query(CustomerAttachment).filter(CustomerAttachment.id == attachment_id).first()
        if not attachment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ek dosya bulunamadı")
        self.db.delete(attachment)
        self.db.commit()

    # ── Nearby Customers (GPS Radar) ──
    def get_nearby_customers(self, lat: float, lng: float, radius_km: float = 25.0, limit: int = 50) -> List[dict]:
        customers = self.db.query(Customer).filter(
            Customer.is_active == True,
            Customer.latitude.isnot(None),
            Customer.longitude.isnot(None)
        ).all()

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0 # km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        results = []
        for c in customers:
            if c.latitude is None or c.longitude is None:
                continue
            try:
                clat = float(c.latitude)
                clng = float(c.longitude)
                if clat == 0 and clng == 0:
                    continue
                dist = haversine(lat, lng, clat, clng)
                if dist <= radius_km:
                    interested_str = None
                    if hasattr(c, "vehicle_interests") and c.vehicle_interests:
                        v_names = []
                        for vi in c.vehicle_interests:
                            if vi.vehicle:
                                grp = getattr(vi.vehicle, 'vehicle_group', '')
                                code = getattr(vi.vehicle, 'model_code', '')
                                v_names.append(f"{grp} {code}".strip() or "IVECO")
                        if v_names:
                            interested_str = ", ".join(v_names[:2])

                    results.append({
                        "id": c.id,
                        "company_name": c.company_name,
                        "city": c.city,
                        "district": c.district,
                        "address": c.address,
                        "phone": c.phone,
                        "sector": c.sector,
                        "segment": c.segment or "C",
                        "potential_score": c.potential_score or 0,
                        "latitude": clat,
                        "longitude": clng,
                        "distance_km": round(dist, 2),
                        "interested_vehicle": interested_str,
                        "apple_maps_url": f"https://maps.apple.com/?daddr={clat},{clng}&dirflg=d",
                        "google_maps_url": f"https://www.google.com/maps/dir/?api=1&destination={clat},{clng}"
                    })
            except (ValueError, TypeError):
                continue

        results.sort(key=lambda x: x["distance_km"])
        return results[:limit]







