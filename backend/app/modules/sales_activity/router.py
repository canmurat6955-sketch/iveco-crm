"""
Sales Activity API endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.sales_activity.service import SalesActivityService
from app.modules.sales_activity.schemas import (
    SalesActivityCreate, SalesActivityUpdate, SalesActivityResponse,
    TemplateCreate, TemplateResponse, PipelineSummary,
    VisitStart, VisitEnd, VisitResponse,
    RouteOptimizeRequest, RouteOptimizeResponse, RoutePlanCreate, RoutePlanResponse,
    CallLogCreate, CallLogSyncRequest, CallLogResponse, CallStatsResponse, ConvertToLeadRequest,
    WhatsAppMessageCreate, WhatsAppSendRequest, WhatsAppMessageResponse,
    CommunicationsTimelineItem,
)


router = APIRouter(prefix="/api/sales", tags=["Satış Aktiviteleri"])



@router.get("/activities", response_model=List[SalesActivityResponse])
def list_activities(
    customer_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return SalesActivityService(db).get_activities(customer_id, status, limit)


@router.post("/activities", response_model=SalesActivityResponse)
def create_activity(data: SalesActivityCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).create_activity(data, current_user.id)


@router.put("/activities/{activity_id}", response_model=SalesActivityResponse)
def update_activity(activity_id: int, data: SalesActivityUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).update_activity(activity_id, data)


@router.get("/pipeline", response_model=PipelineSummary)
def get_pipeline(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).get_pipeline()


@router.get("/today")
def today_calls(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).get_today_calls()


@router.get("/follow-ups")
def follow_ups(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).get_follow_ups()


@router.post("/whatsapp-link")
def whatsapp_link(
    customer_id: int,
    message: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """WhatsApp deep link oluştur."""
    return {"link": SalesActivityService(db).generate_whatsapp_link(customer_id, message)}


@router.get("/templates", response_model=List[TemplateResponse])
def list_templates(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return SalesActivityService(db).get_templates(category)


@router.post("/templates", response_model=TemplateResponse)
def create_template(data: TemplateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).create_template(data)


@router.put("/templates/{template_id}", response_model=TemplateResponse)
def update_template(template_id: int, data: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return SalesActivityService(db).update_template(template_id, data)


# ── Ziyaret Modu (Visit Mode) ──

@router.get("/visits/active", response_model=Optional[VisitResponse])
def get_active_visit(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Kullanıcının devam eden aktif ziyaretini getirir."""
    return SalesActivityService(db).get_active_visit(current_user.id)


@router.post("/visits/start", response_model=VisitResponse)
def start_visit(data: VisitStart, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Ziyareti başlatır."""
    return SalesActivityService(db).start_visit(current_user.id, data)


@router.post("/visits/{visit_id}/end", response_model=VisitResponse)
def end_visit(visit_id: int, data: VisitEnd, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Ziyareti sonlandırır."""
    return SalesActivityService(db).end_visit(visit_id, current_user.id, data)


# ── Rota Planlayıcı (Route Planner) ──

@router.post("/routes/optimize", response_model=RouteOptimizeResponse)
def optimize_route(data: RouteOptimizeRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Çoklu durakları en verimli sürüş sırasına göre optimize eder."""
    return SalesActivityService(db).optimize_route(data)


@router.post("/routes", response_model=RoutePlanResponse)
def create_route_plan(data: RoutePlanCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yeni bir rota planı kaydeder."""
    return SalesActivityService(db).create_route_plan(current_user.id, data)


@router.get("/routes", response_model=List[RoutePlanResponse])
def get_route_plans(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Kullanıcının kayıtlı rota planlarını döner."""
    return SalesActivityService(db).get_route_plans(current_user.id)


@router.get("/routes/{plan_id}", response_model=RoutePlanResponse)
def get_route_plan(plan_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Belirli bir rota planının detaylarını döner."""
    return SalesActivityService(db).get_route_plan(plan_id, current_user.id)


@router.delete("/routes/{plan_id}")
def delete_route_plan(plan_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Rota planını siler."""
    SalesActivityService(db).delete_route_plan(plan_id, current_user.id)
    return {"message": "Rota planı başarıyla silindi"}


@router.put("/routes/{plan_id}/stops/{stop_id}/visited")
def mark_stop_visited(
    plan_id: int,
    stop_id: int,
    visited: bool = Query(True),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Rota durağının ziyaret edilme durumunu günceller."""
    return SalesActivityService(db).mark_stop_visited(plan_id, stop_id, current_user.id, visited)


# ── Çağrı Takip (Call Tracking) Endpoints ──

@router.post("/calls", response_model=CallLogResponse)
def create_call_log(
    data: CallLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Yeni bir arama kaydı oluşturur ve otomatik müşteri eşlemesi yapar."""
    return SalesActivityService(db).create_call_log(data, current_user.id)


@router.post("/calls/sync")
def sync_call_logs(
    request: CallLogSyncRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Android / mobil cihazdan çağrı günlüğü toplu senkronizasyonu."""
    return SalesActivityService(db).sync_call_logs(request, current_user.id)


@router.get("/calls", response_model=List[CallLogResponse])
def get_call_logs(
    customer_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    direction: Optional[str] = Query(None),
    unmatched_only: bool = Query(False),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Çağrı geçmişini listeler."""
    return SalesActivityService(db).get_call_logs(customer_id, user_id, direction, unmatched_only, limit)


@router.get("/calls/stats", response_model=CallStatsResponse)
def get_call_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Çağrı özet istatistiklerini getirir."""
    return SalesActivityService(db).get_call_stats()


@router.post("/calls/{call_id}/convert-to-lead")
def convert_call_to_lead(
    call_id: int,
    data: ConvertToLeadRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Bilinmeyen arayan numarayı tek tıkla CRM müşterisine çevirir."""
    return SalesActivityService(db).convert_call_to_lead(call_id, data, current_user.id)


# ── WhatsApp & Webhook Endpoints ──

@router.get("/webhooks/whatsapp")
def verify_meta_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
):
    """Meta WhatsApp Cloud API webhook doğrulama endpoint'i."""
    from fastapi.responses import PlainTextResponse
    if hub_mode == "subscribe" and hub_challenge:
        return PlainTextResponse(content=hub_challenge)
    return {"status": "whatsapp_webhook_ready"}


@router.post("/webhooks/whatsapp")
def receive_meta_webhook(
    payload: dict,
    db: Session = Depends(get_db),
):
    """Meta WhatsApp Cloud API'den veya harici ağ geçidinden gelen canlı mesajları işler."""
    return SalesActivityService(db).handle_meta_webhook(payload)


@router.post("/whatsapp/send")
def send_whatsapp_message(
    data: WhatsAppSendRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Müşteriye WhatsApp mesajı/şablonu gönderir ve konuşma geçmişine kaydeder."""
    return SalesActivityService(db).send_whatsapp_message(data, current_user.id)


@router.post("/whatsapp/log", response_model=WhatsAppMessageResponse)
def log_whatsapp_message(
    data: WhatsAppMessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Manuel veya Web eklentisinden gelen WhatsApp mesajını CRM'e işler."""
    return SalesActivityService(db).log_whatsapp_message(data, current_user.id)


@router.get("/whatsapp/messages", response_model=List[WhatsAppMessageResponse])
def get_whatsapp_messages(
    customer_id: Optional[int] = Query(None),
    phone_number: Optional[str] = Query(None),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """WhatsApp mesaj geçmişini getirir."""
    return SalesActivityService(db).get_whatsapp_messages(customer_id, phone_number, limit)


# ── Unified Communications Timeline ──

@router.get("/communications/timeline/{customer_id}", response_model=List[CommunicationsTimelineItem])
def get_communications_timeline(
    customer_id: int,
    limit: int = Query(50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Müşterinin aramalar, WhatsApp ve ziyaretlerden oluşan birleşik iletişim zaman tüneli."""
    return SalesActivityService(db).get_communications_timeline(customer_id, limit)


