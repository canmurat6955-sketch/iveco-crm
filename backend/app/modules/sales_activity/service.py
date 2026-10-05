import re
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException

from app.modules.sales_activity.models import (
    SalesActivity, MessageTemplate, Visit, RoutePlan, RouteStop,
    CallLog, WhatsAppMessage
)
from app.modules.sales_activity.schemas import (
    SalesActivityCreate, SalesActivityUpdate, SalesActivityResponse,
    TemplateCreate, PipelineSummary, VisitStart, VisitEnd,
    RoutePlanCreate, RouteOptimizeRequest, RouteOptimizeResponse, OptimizedStop,
    CallLogCreate, CallLogSyncRequest, CallLogResponse, CallStatsResponse, ConvertToLeadRequest,
    WhatsAppMessageCreate, WhatsAppSendRequest, WhatsAppMessageResponse,
    CommunicationsTimelineItem,
)
from app.modules.crm.models import Customer, CustomerInteraction, CustomerContact
from app.modules.auth.models import User


def normalize_phone(phone: Optional[str]) -> str:
    """Telefon numarasını 10 haneli standart Türk telefon numarası formatına dönüştürür."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", str(phone))
    if digits.startswith("90") and len(digits) == 12:
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    return digits




class SalesActivityService:
    def __init__(self, db: Session):
        self.db = db

    def get_activities(self, customer_id: Optional[int] = None, status_filter: Optional[str] = None, limit: int = 50):
        query = self.db.query(SalesActivity)
        if customer_id:
            query = query.filter(SalesActivity.customer_id == customer_id)
        if status_filter:
            query = query.filter(SalesActivity.status == status_filter)
        activities = query.order_by(desc(SalesActivity.created_at)).limit(limit).all()

        result = []
        for a in activities:
            resp = SalesActivityResponse.model_validate(a)
            customer = self.db.query(Customer).filter(Customer.id == a.customer_id).first()
            resp.customer_name = customer.company_name if customer else None
            result.append(resp)
        return result

    def create_activity(self, data: SalesActivityCreate, user_id: int) -> SalesActivityResponse:
        # Verify customer exists
        customer = self.db.query(Customer).filter(Customer.id == data.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı")

        activity = SalesActivity(user_id=user_id, **data.model_dump())
        self.db.add(activity)

        # Pipeline aşamasını ve son iletişim tarihini otomatik güncelle
        customer.last_contact_date = datetime.now(timezone.utc).date()
        customer.updated_at = datetime.utcnow()
        if data.status in ["offer_given", "proposal", "quoted"]:
            customer.pipeline_stage = "proposal"
            customer.pipeline_note = data.notes or f"Teklif İletildi ({data.activity_type.upper()})"
            customer.potential_score = max(customer.potential_score or 0, 95)
            customer.potential_level = "very_high"
        elif data.status == "won":
            customer.pipeline_stage = "won"
            customer.potential_score = 100
        elif data.status == "lost":
            customer.pipeline_stage = "lost"
        elif customer.pipeline_stage == "lead":
            customer.pipeline_stage = "contact"
            customer.potential_score = max(customer.potential_score or 0, 75)

        self.db.commit()
        self.db.refresh(activity)

        resp = SalesActivityResponse.model_validate(activity)
        resp.customer_name = customer.company_name
        return resp

    def update_activity(self, activity_id: int, data: SalesActivityUpdate) -> SalesActivityResponse:
        activity = self.db.query(SalesActivity).filter(SalesActivity.id == activity_id).first()
        if not activity:
            raise HTTPException(status_code=404, detail="Aktivite bulunamadı")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(activity, field, value)

        if data.status:
            customer = self.db.query(Customer).filter(Customer.id == activity.customer_id).first()
            if customer:
                customer.updated_at = datetime.utcnow()
                if data.status in ["offer_given", "proposal", "quoted"]:
                    customer.pipeline_stage = "proposal"
                    customer.potential_score = max(customer.potential_score or 0, 95)
                    customer.potential_level = "very_high"
                elif data.status == "won":
                    customer.pipeline_stage = "won"
                    customer.potential_score = 100
                elif data.status == "lost":
                    customer.pipeline_stage = "lost"

        self.db.commit()
        self.db.refresh(activity)

        resp = SalesActivityResponse.model_validate(activity)
        customer = self.db.query(Customer).filter(Customer.id == activity.customer_id).first()
        resp.customer_name = customer.company_name if customer else None
        return resp

    def get_pipeline(self) -> PipelineSummary:
        statuses = dict(
            self.db.query(SalesActivity.status, func.count(SalesActivity.id))
            .group_by(SalesActivity.status).all()
        )
        total = sum(statuses.values())
        return PipelineSummary(
            sent=statuses.get("sent", 0),
            replied=statuses.get("replied", 0),
            offer_given=statuses.get("offer_given", 0),
            follow_up=statuses.get("follow_up", 0),
            hot_lead=statuses.get("hot_lead", 0),
            converted=statuses.get("converted", 0),
            lost=statuses.get("lost", 0),
            total=total,
        )

    def get_today_calls(self):
        """Get customers with follow-up date today or overdue."""
        today = date.today()
        activities = (
            self.db.query(SalesActivity)
            .filter(SalesActivity.next_follow_up <= today, SalesActivity.status.notin_(["converted", "lost"]))
            .order_by(SalesActivity.next_follow_up)
            .all()
        )
        result = []
        for a in activities:
            customer = self.db.query(Customer).filter(Customer.id == a.customer_id).first()
            result.append({
                "activity_id": a.id,
                "customer_id": a.customer_id,
                "customer_name": customer.company_name if customer else "Bilinmiyor",
                "city": customer.city if customer else None,
                "phone": customer.phone if customer else None,
                "status": a.status,
                "next_follow_up": str(a.next_follow_up),
                "notes": a.notes,
            })
        return result

    def get_follow_ups(self):
        """Get all pending follow-ups."""
        return self.get_today_calls()

    def generate_whatsapp_link(self, customer_id: int, message: str) -> str:
        """Generate WhatsApp deep link for a customer."""
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer or not customer.phone:
            raise HTTPException(status_code=400, detail="Müşteri telefonu bulunamadı")
        phone = customer.phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if phone.startswith("0"):
            phone = "90" + phone[1:]
        elif not phone.startswith("90") and not phone.startswith("+90"):
            phone = "90" + phone
        phone = phone.replace("+", "")
        import urllib.parse
        encoded_msg = urllib.parse.quote(message)
        return f"https://wa.me/{phone}?text={encoded_msg}"

    # ── Templates ──────────────────────────────────────────────

    def get_templates(self, category: Optional[str] = None):
        query = self.db.query(MessageTemplate).filter(MessageTemplate.is_active == True)
        if category:
            query = query.filter(MessageTemplate.category == category)
        return query.all()

    def create_template(self, data: TemplateCreate) -> MessageTemplate:
        template = MessageTemplate(**data.model_dump())
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def update_template(self, template_id: int, data: dict) -> MessageTemplate:
        template = self.db.query(MessageTemplate).filter(MessageTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Şablon bulunamadı")
        for key, val in data.items():
            if hasattr(template, key):
                setattr(template, key, val)
        self.db.commit()
        self.db.refresh(template)
        return template

    # ── Ziyaret Modu (Visit Mode) ──

    def get_active_visit(self, user_id: int) -> Optional[Visit]:
        """Kullanıcının şu an aktif (başlamış ama bitmemiş) olan ziyaretini getirir."""
        return self.db.query(Visit).filter(
            Visit.user_id == user_id,
            Visit.ended_at.is_(None)
        ).first()

    def start_visit(self, user_id: int, data: VisitStart) -> Visit:
        """Yeni bir ziyaret başlatır."""
        # Aktif ziyaret kontrolü
        active = self.get_active_visit(user_id)
        if active:
            raise HTTPException(
                status_code=400, 
                detail="Şu anda aktif bir ziyaretiniz bulunuyor. Yeni ziyaret başlatmak için önce mevcut ziyareti sonlandırmalısınız."
            )
            
        visit = Visit(
            customer_id=data.customer_id,
            user_id=user_id,
            start_latitude=data.start_latitude,
            start_longitude=data.start_longitude,
            accuracy=data.accuracy,
            address=data.address,
            started_at=datetime.now(timezone.utc)
        )
        self.db.add(visit)
        self.db.commit()
        self.db.refresh(visit)
        return visit

    def end_visit(self, visit_id: int, user_id: int, data: VisitEnd) -> Visit:
        """Devam eden ziyareti sonlandırır ve müşteri etkileşim geçmişine kaydeder."""
        visit = self.db.query(Visit).filter(
            Visit.id == visit_id,
            Visit.user_id == user_id
        ).first()
        
        if not visit:
            raise HTTPException(status_code=404, detail="Ziyaret kaydı bulunamadı")
        if visit.ended_at:
            raise HTTPException(status_code=400, detail="Bu ziyaret zaten sonlandırılmış")
            
        visit.ended_at = datetime.now(timezone.utc)
        visit.notes = data.notes
        visit.outcome = data.outcome
        visit.next_action = data.next_action
        visit.next_follow_up_date = data.next_follow_up_date
        visit.end_latitude = data.end_latitude
        visit.end_longitude = data.end_longitude
        
        # 1. CRM Müşterisine Son Ziyaret Tarihini ve Son Aşamayı Yaz
        customer = self.db.query(Customer).filter(Customer.id == visit.customer_id).first()
        if customer:
            customer.last_contact_date = datetime.now(timezone.utc).date()
            if data.outcome == "Teklif Verildi":
                customer.pipeline_stage = "proposal"
            elif data.outcome == "Satış Gerçekleşti":
                customer.pipeline_stage = "won"
            elif data.outcome == "Olumsuz":
                customer.pipeline_stage = "lost"
            elif customer.pipeline_stage == "lead":
                customer.pipeline_stage = "contact"
                
        # 2. Müşteri Etkileşim Geçmişine (customer_interactions) otomatik ekle
        interaction = CustomerInteraction(
            customer_id=visit.customer_id,
            user_id=user_id,
            interaction_type="visit",
            notes=data.notes,
            next_action=data.next_action,
            created_at=datetime.now(timezone.utc)
        )
        # next_action_date sütunu constructor dışından atanıyor (model alan adı farklılığı)
        interaction.next_action_date = data.next_follow_up_date
        
        self.db.add(interaction)
        self.db.commit()
        self.db.refresh(visit)
        return visit

    # ── Rota Planlayıcı (Route Planner) ──

    def optimize_route(self, data: RouteOptimizeRequest) -> RouteOptimizeResponse:
        """Çoklu ziyaret noktalarını en kısa rota sırasına göre optimize eder (Nearest Neighbor TSP)."""
        from math import radians, cos, sin, asin, sqrt

        def get_dist(lat1, lon1, lat2, lon2):
            if not lat1 or not lon1 or not lat2 or not lon2:
                return 9999999.0
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return c * 6371000  # Metre

        # Müşterileri veritabanından çek (Konumu NULL olmayanları bul)
        customers = self.db.query(Customer).filter(
            Customer.id.in_(data.customer_ids)
        ).all()

        unvisited = []
        for c in customers:
            unvisited.append({
                "id": c.id,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "company_name": c.company_name
            })

        optimized = []
        curr_lat = data.start_latitude
        curr_lon = data.start_longitude
        total_distance = 0.0
        seq = 1

        while unvisited:
            # En yakın noktayı bul
            nearest_idx = 0
            min_dist = 99999999.0
            
            for idx, item in enumerate(unvisited):
                d = get_dist(curr_lat, curr_lon, item["latitude"], item["longitude"])
                if d < min_dist:
                    min_dist = d
                    nearest_idx = idx

            nearest_item = unvisited.pop(nearest_idx)
            total_distance += min_dist if min_dist != 9999999.0 else 0.0
            
            optimized.append(OptimizedStop(
                customer_id=nearest_item["id"],
                sequence_order=seq,
                distance_from_previous=min_dist if min_dist != 9999999.0 else 0.0
            ))
            
            curr_lat = nearest_item["latitude"] or curr_lat
            curr_lon = nearest_item["longitude"] or curr_lon
            seq += 1

        return RouteOptimizeResponse(optimized_stops=optimized, total_distance=total_distance)

    def create_route_plan(self, user_id: int, data: RoutePlanCreate) -> RoutePlan:
        """Yeni bir rota planı ve duraklarını oluşturur."""
        plan = RoutePlan(
            user_id=user_id,
            name=data.name,
            date=data.date,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)

        for stop_in in data.stops:
            stop = RouteStop(
                route_plan_id=plan.id,
                customer_id=stop_in.customer_id,
                sequence_order=stop_in.sequence_order,
                visited=False
            )
            self.db.add(stop)

        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_route_plans(self, user_id: int) -> List[RoutePlan]:
        """Kullanıcının tüm rota planlarını listeler."""
        return self.db.query(RoutePlan).filter(
            RoutePlan.user_id == user_id
        ).order_by(desc(RoutePlan.date)).all()

    def get_route_plan(self, plan_id: int, user_id: int) -> RoutePlan:
        """Belirli bir rota planının detaylarını çeker."""
        plan = self.db.query(RoutePlan).filter(
            RoutePlan.id == plan_id,
            RoutePlan.user_id == user_id
        ).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Rota planı bulunamadı")
        return plan

    def delete_route_plan(self, plan_id: int, user_id: int):
        """Rota planını siler."""
        plan = self.get_route_plan(plan_id, user_id)
        self.db.delete(plan)
        self.db.commit()

    def mark_stop_visited(self, plan_id: int, stop_id: int, user_id: int, visited: bool = True) -> RouteStop:
        """Rota durağının ziyaret edildi durumunu günceller."""
        # Plan kontrolü
        plan = self.get_route_plan(plan_id, user_id)
        
        stop = self.db.query(RouteStop).filter(
            RouteStop.id == stop_id,
            RouteStop.route_plan_id == plan.id
        ).first()
        
        if not stop:
            raise HTTPException(status_code=404, detail="Rota durağı bulunamadı")
            
        stop.visited = visited
        stop.visited_at = datetime.now(timezone.utc) if visited else None
        self.db.commit()
        self.db.refresh(stop)
        return stop

    # ── TELEPHONY & CALL TRACKING ──────────────────────────────────────

    def find_customer_and_contact_by_phone(self, phone: str):
        """Telefon numarasını hem Customer hem de CustomerContact tablolarında tarar."""
        norm = normalize_phone(phone)
        if not norm or len(norm) < 7:
            return None, None, "unmatched"

        # 1. Customer tablosunda ara
        customers = self.db.query(Customer).filter(Customer.is_active == True).all()
        for c in customers:
            if c.phone and normalize_phone(c.phone) == norm:
                return c, None, "customer_phone"

        # 2. CustomerContact tablosunda ara
        contacts = self.db.query(CustomerContact).all()
        for cont in contacts:
            if cont.phone and normalize_phone(cont.phone) == norm:
                c = self.db.query(Customer).filter(Customer.id == cont.customer_id).first()
                return c, cont, "contact_phone"

        return None, None, "unmatched"

    def create_call_log(self, data: CallLogCreate, user_id: int) -> CallLogResponse:
        """Yeni bir arama kaydı oluşturur, müşteriyi otomatik eşler ve müşteri zaman tüneline ekler."""
        norm_phone = normalize_phone(data.phone_number)
        
        customer_id = data.customer_id
        contact_id = data.contact_id
        matched_by = "manual" if customer_id else None

        if not customer_id:
            cust, cont, match_type = self.find_customer_and_contact_by_phone(data.phone_number)
            if cust:
                customer_id = cust.id
                contact_id = cont.id if cont else None
                matched_by = match_type
            else:
                matched_by = "unmatched"

        call_date = data.call_date or datetime.now(timezone.utc)

        call = CallLog(
            customer_id=customer_id,
            contact_id=contact_id,
            user_id=user_id,
            phone_number=data.phone_number,
            normalized_phone=norm_phone,
            direction=data.direction,
            duration_seconds=data.duration_seconds,
            call_status=data.call_status,
            call_date=call_date,
            outcome=data.outcome,
            notes=data.notes,
            recording_url=data.recording_url,
            source=data.source,
            matched_by=matched_by,
        )
        self.db.add(call)

        # Müşteri bulunduysa son iletişim tarihini ve müşteri etkileşimini güncelle
        if customer_id:
            customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
            if customer:
                customer.last_contact_date = call_date.date() if hasattr(call_date, 'date') else call_date
                
                dir_label = "Giden Çağrı" if data.direction == "outbound" else ("Gelen Çağrı" if data.direction == "inbound" else "Cevapsız Çağrı")
                mins = data.duration_seconds // 60
                secs = data.duration_seconds % 60
                dur_str = f" ({mins} dk {secs} sn)" if data.duration_seconds > 0 else ""
                outcome_str = f" · Sonuç: {data.outcome}" if data.outcome else ""
                intr_notes = f"{dir_label}{dur_str}{outcome_str}. {data.notes or ''}".strip()
                
                interaction = CustomerInteraction(
                    customer_id=customer_id,
                    user_id=user_id,
                    interaction_type="call",
                    notes=intr_notes,
                    created_at=call_date,
                )
                self.db.add(interaction)

        self.db.commit()
        self.db.refresh(call)
        return self._format_call_response(call)

    def _format_call_response(self, call: CallLog) -> CallLogResponse:
        company_name = None
        if call.customer_id:
            c = self.db.query(Customer).filter(Customer.id == call.customer_id).first()
            company_name = c.company_name if c else None
            
        contact_name = None
        if call.contact_id:
            cont = self.db.query(CustomerContact).filter(CustomerContact.id == call.contact_id).first()
            contact_name = cont.contact_name if cont else None

        user_name = None
        u = self.db.query(User).filter(User.id == call.user_id).first()
        user_name = u.full_name if u else None

        resp = CallLogResponse.model_validate(call)
        resp.company_name = company_name
        resp.contact_name = contact_name
        resp.user_name = user_name
        return resp

    def sync_call_logs(self, request: CallLogSyncRequest, user_id: int) -> dict:
        """Android Companion / mobil uygulamadan toplu çağrı geçmişi senkronizasyonu."""
        synced_count = 0
        matched_count = 0

        for item in request.items:
            norm = normalize_phone(item.phone_number)
            # Mükerrer çağrı kontrolü
            existing = self.db.query(CallLog).filter(
                CallLog.user_id == user_id,
                CallLog.normalized_phone == norm,
                func.abs(func.extract('epoch', CallLog.call_date) - func.extract('epoch', item.call_date)) < 90
            ).first()

            if existing:
                continue

            cust, cont, match_type = self.find_customer_and_contact_by_phone(item.phone_number)
            customer_id = cust.id if cust else None
            contact_id = cont.id if cont else None

            call = CallLog(
                customer_id=customer_id,
                contact_id=contact_id,
                user_id=user_id,
                phone_number=item.phone_number,
                normalized_phone=norm,
                direction=item.direction,
                duration_seconds=item.duration_seconds,
                call_status=item.call_status,
                call_date=item.call_date,
                notes=item.notes,
                source=item.source or "android_companion",
                matched_by=match_type,
            )
            self.db.add(call)
            synced_count += 1
            if customer_id:
                matched_count += 1
                cust.last_contact_date = item.call_date.date() if hasattr(item.call_date, 'date') else item.call_date

        self.db.commit()
        return {
            "synced_count": synced_count,
            "matched_count": matched_count,
            "total_sent": len(request.items)
        }

    def get_call_logs(
        self,
        customer_id: Optional[int] = None,
        user_id: Optional[int] = None,
        direction: Optional[str] = None,
        unmatched_only: bool = False,
        limit: int = 100
    ) -> List[CallLogResponse]:
        """Arama kayıtlarını filtreli olarak listeler."""
        query = self.db.query(CallLog)
        if customer_id:
            query = query.filter(CallLog.customer_id == customer_id)
        if user_id:
            query = query.filter(CallLog.user_id == user_id)
        if direction:
            query = query.filter(CallLog.direction == direction)
        if unmatched_only:
            query = query.filter(CallLog.customer_id == None)

        calls = query.order_by(desc(CallLog.call_date)).limit(limit).all()
        return [self._format_call_response(c) for c in calls]

    def get_call_stats(self) -> CallStatsResponse:
        """Genel çağrı istatistiklerini hesaplar."""
        total = self.db.query(CallLog).count()
        total_duration = self.db.query(func.coalesce(func.sum(CallLog.duration_seconds), 0)).scalar() or 0
        inbound = self.db.query(CallLog).filter(CallLog.direction == "inbound").count()
        outbound = self.db.query(CallLog).filter(CallLog.direction == "outbound").count()
        missed = self.db.query(CallLog).filter(CallLog.direction == "missed").count()
        unmatched = self.db.query(CallLog).filter(CallLog.customer_id == None).count()

        return CallStatsResponse(
            total_calls=total,
            total_duration_seconds=int(total_duration),
            inbound_count=inbound,
            outbound_count=outbound,
            missed_count=missed,
            unmatched_count=unmatched
        )

    def convert_call_to_lead(self, call_id: int, data: ConvertToLeadRequest, user_id: int) -> dict:
        """Bilinmeyen numaralı bir çağrıyı yeni bir CRM müşterisine dönüştürür."""
        call = self.db.query(CallLog).filter(CallLog.id == call_id).first()
        if not call:
            raise HTTPException(status_code=404, detail="Arama kaydı bulunamadı")

        customer = Customer(
            company_name=data.company_name,
            phone=call.phone_number,
            city=data.city or "Samsun",
            district=data.district,
            sector=data.sector,
            source="call_lead",
            pipeline_stage="lead",
            assigned_to_id=user_id,
            sales_notes=f"Gelen arama kaydından oluşturuldu: {call.notes or 'İlk telefon teması'}",
            last_contact_date=call.call_date.date() if hasattr(call.call_date, 'date') else call.call_date,
            potential_score=50,
            potential_level="medium"
        )
        self.db.add(customer)
        self.db.flush()

        if data.contact_name:
            contact = CustomerContact(
                customer_id=customer.id,
                contact_name=data.contact_name,
                phone=call.phone_number,
                is_primary=True,
                role="Yetkili"
            )
            self.db.add(contact)
            self.db.flush()
            call.contact_id = contact.id

        norm = call.normalized_phone
        self.db.query(CallLog).filter(CallLog.normalized_phone == norm).update({"customer_id": customer.id})
        self.db.query(WhatsAppMessage).filter(WhatsAppMessage.normalized_phone == norm).update({"customer_id": customer.id})

        self.db.commit()
        self.db.refresh(customer)
        return {"customer_id": customer.id, "message": f"{data.company_name} CRM'e aday müşteri olarak kaydedildi."}

    # ── WHATSAPP COMMUNICATIONS ────────────────────────────────────────

    def log_whatsapp_message(self, data: WhatsAppMessageCreate, user_id: Optional[int] = None) -> WhatsAppMessageResponse:
        """WhatsApp mesajını kaydeder, müşteriyi otomatik eşler."""
        norm_phone = normalize_phone(data.phone_number)
        
        customer_id = data.customer_id
        contact_id = data.contact_id

        if not customer_id:
            cust, cont, _ = self.find_customer_and_contact_by_phone(data.phone_number)
            if cust:
                customer_id = cust.id
                contact_id = cont.id if cont else None

        msg = WhatsAppMessage(
            customer_id=customer_id,
            contact_id=contact_id,
            user_id=user_id,
            phone_number=data.phone_number,
            normalized_phone=norm_phone,
            direction=data.direction,
            message_type=data.message_type,
            content=data.content,
            media_url=data.media_url,
            status="sent" if data.direction == "outbound" else "received",
            source="manual_log"
        )
        self.db.add(msg)

        if customer_id:
            customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
            if customer:
                customer.last_contact_date = datetime.now(timezone.utc).date()
                interaction = CustomerInteraction(
                    customer_id=customer_id,
                    user_id=user_id or 1,
                    interaction_type="whatsapp",
                    notes=f"WhatsApp ({'Giden' if data.direction == 'outbound' else 'Gelen'}): {data.content[:150]}",
                    created_at=datetime.now(timezone.utc),
                )
                self.db.add(interaction)

        self.db.commit()
        self.db.refresh(msg)
        return self._format_whatsapp_response(msg)

    def _format_whatsapp_response(self, msg: WhatsAppMessage) -> WhatsAppMessageResponse:
        company_name = None
        if msg.customer_id:
            c = self.db.query(Customer).filter(Customer.id == msg.customer_id).first()
            company_name = c.company_name if c else None
            
        contact_name = None
        if msg.contact_id:
            cont = self.db.query(CustomerContact).filter(CustomerContact.id == msg.contact_id).first()
            contact_name = cont.contact_name if cont else None

        resp = WhatsAppMessageResponse.model_validate(msg)
        resp.company_name = company_name
        resp.contact_name = contact_name
        return resp

    def get_whatsapp_messages(
        self,
        customer_id: Optional[int] = None,
        phone_number: Optional[str] = None,
        limit: int = 100
    ) -> List[WhatsAppMessageResponse]:
        """WhatsApp sohbet mesajlarını listeler."""
        from urllib.parse import quote_plus
        query = self.db.query(WhatsAppMessage)
        if customer_id:
            query = query.filter(WhatsAppMessage.customer_id == customer_id)
        elif phone_number:
            norm = normalize_phone(phone_number)
            query = query.filter(WhatsAppMessage.normalized_phone == norm)

        messages = query.order_by(WhatsAppMessage.created_at.asc()).limit(limit).all()
        return [self._format_whatsapp_response(m) for m in messages]

    def send_whatsapp_message(self, data: WhatsAppSendRequest, user_id: int) -> dict:
        """Müşteriye WhatsApp mesajı veya şablonu oluşturur ve loglar."""
        from urllib.parse import quote_plus
        customer = self.db.query(Customer).filter(Customer.id == data.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
        if not customer.phone:
            raise HTTPException(status_code=400, detail="Müşterinin telefon numarası kayıtlı değil")

        norm = normalize_phone(customer.phone)
        link = f"https://wa.me/90{norm}?text={quote_plus(data.message)}"

        msg = WhatsAppMessage(
            customer_id=customer.id,
            user_id=user_id,
            phone_number=customer.phone,
            normalized_phone=norm,
            direction="outbound",
            message_type="template" if data.template_name else "text",
            content=data.message,
            status="sent",
            source="crm_web"
        )
        self.db.add(msg)
        customer.last_contact_date = datetime.now(timezone.utc).date()

        interaction = CustomerInteraction(
            customer_id=customer.id,
            user_id=user_id,
            interaction_type="whatsapp",
            notes=f"WhatsApp İletisi: {data.message[:150]}",
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(interaction)

        self.db.commit()
        return {"status": "logged", "whatsapp_link": link, "message_id": msg.id}

    def handle_meta_webhook(self, payload: dict) -> dict:
        """Meta WhatsApp Cloud API gelen webhook mesajlarını işler ve CRM'e kaydeder."""
        processed = 0
        try:
            entries = payload.get("entry", [])
            for entry in entries:
                changes = entry.get("changes", [])
                for change in changes:
                    value = change.get("value", {})
                    messages = value.get("messages", [])
                    contacts = value.get("contacts", [])
                    sender_profile_name = contacts[0].get("profile", {}).get("name") if contacts else None

                    for m in messages:
                        from_phone = m.get("from")
                        msg_id = m.get("id")
                        msg_type = m.get("type", "text")
                        
                        body = ""
                        media_url = None
                        if msg_type == "text":
                            body = m.get("text", {}).get("body", "")
                        elif msg_type == "image":
                            body = "[Görsel]"
                            media_url = m.get("image", {}).get("id")
                        elif msg_type == "document":
                            body = f"[Belge: {m.get('document', {}).get('filename', '')}]"
                        else:
                            body = f"[{msg_type.capitalize()} Mesajı]"

                        norm = normalize_phone(from_phone)
                        cust, cont, _ = self.find_customer_and_contact_by_phone(from_phone)
                        customer_id = cust.id if cust else None
                        contact_id = cont.id if cont else None

                        msg = WhatsAppMessage(
                            customer_id=customer_id,
                            contact_id=contact_id,
                            phone_number=from_phone,
                            normalized_phone=norm,
                            message_id=msg_id,
                            direction="inbound",
                            sender_name=sender_profile_name or (cust.company_name if cust else None),
                            message_type=msg_type,
                            content=body,
                            media_url=media_url,
                            status="received",
                            source="meta_api"
                        )
                        self.db.add(msg)
                        processed += 1

                        if cust:
                            cust.last_contact_date = datetime.now(timezone.utc).date()
                            interaction = CustomerInteraction(
                                customer_id=cust.id,
                                user_id=cust.assigned_to_id or 1,
                                interaction_type="whatsapp",
                                notes=f"WhatsApp (Gelen): {body[:150]}",
                                created_at=datetime.now(timezone.utc)
                            )
                            self.db.add(interaction)

            self.db.commit()
            return {"status": "success", "processed_messages": processed}
        except Exception as e:
            self.db.rollback()
            return {"status": "error", "detail": str(e)}

    # ── UNIFIED COMMUNICATIONS TIMELINE ────────────────────────────────

    def get_communications_timeline(self, customer_id: int, limit: int = 50) -> List[CommunicationsTimelineItem]:
        """Müşteriye ait tüm çağrı, WhatsApp ve ziyaret kayıtlarını birleşik zaman tüneli olarak döndürür."""
        items = []

        # 1. Aramalar
        calls = self.db.query(CallLog).filter(CallLog.customer_id == customer_id).order_by(desc(CallLog.call_date)).limit(limit).all()
        for c in calls:
            mins = c.duration_seconds // 60
            secs = c.duration_seconds % 60
            dur_text = f"{mins} dk {secs} sn" if c.duration_seconds > 0 else "0 sn"
            dir_tr = "Giden Çağrı" if c.direction == "outbound" else ("Gelen Çağrı" if c.direction == "inbound" else "Cevapsız Çağrı")
            
            u = self.db.query(User).filter(User.id == c.user_id).first()
            actor = u.full_name if u else None

            items.append(CommunicationsTimelineItem(
                id=c.id,
                item_type="call",
                timestamp=c.call_date,
                title=f"{dir_tr} ({dur_text})",
                summary=c.notes or (f"Sonuç: {c.outcome}" if c.outcome else "Arama kaydı"),
                direction=c.direction,
                duration_seconds=c.duration_seconds,
                outcome=c.outcome,
                status=c.call_status,
                media_url=c.recording_url,
                actor_name=actor
            ))

        # 2. WhatsApp Mesajları
        wms = self.db.query(WhatsAppMessage).filter(WhatsAppMessage.customer_id == customer_id).order_by(desc(WhatsAppMessage.created_at)).limit(limit).all()
        for w in wms:
            u = self.db.query(User).filter(User.id == w.user_id).first() if w.user_id else None
            actor = u.full_name if u else (w.sender_name or "Müşteri")

            items.append(CommunicationsTimelineItem(
                id=w.id,
                item_type="whatsapp",
                timestamp=w.created_at,
                title="WhatsApp Mesajı" + (" (Giden)" if w.direction == "outbound" else " (Gelen)"),
                summary=w.content,
                direction=w.direction,
                status=w.status,
                media_url=w.media_url,
                actor_name=actor
            ))

        # 3. Ziyaretler
        visits = self.db.query(Visit).filter(Visit.customer_id == customer_id).order_by(desc(Visit.started_at)).limit(limit).all()
        for v in visits:
            u = self.db.query(User).filter(User.id == v.user_id).first()
            actor = u.full_name if u else None

            items.append(CommunicationsTimelineItem(
                id=v.id,
                item_type="visit",
                timestamp=v.started_at,
                title="Saha Müşteri Ziyareti",
                summary=f"Sonuç: {v.outcome or 'Görüşüldü'}. {v.notes or ''}".strip(),
                status="completed" if v.ended_at else "in_progress",
                actor_name=actor
            ))

        # Kronolojik olarak tersten sırala (en yeni en üstte)
        items.sort(key=lambda x: x.timestamp, reverse=True)
        return items[:limit]


