"""
Sales Activity service.
"""
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException

from app.modules.sales_activity.models import SalesActivity, MessageTemplate, Visit, RoutePlan, RouteStop
from app.modules.sales_activity.schemas import (
    SalesActivityCreate, SalesActivityUpdate, SalesActivityResponse,
    TemplateCreate, PipelineSummary, VisitStart, VisitEnd,
    RoutePlanCreate, RouteOptimizeRequest, RouteOptimizeResponse, OptimizedStop,
)
from app.modules.crm.models import Customer, CustomerInteraction




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
            next_follow_up_date=data.next_follow_up_date, # Date tipinde
            created_at=datetime.now(timezone.utc)
        )
        # SQLAlchemy models.py'da next_action_date olarak tanımlanmış, crm/models.py:67: next_action_date
        # name mismatch düzeltmesi:
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


