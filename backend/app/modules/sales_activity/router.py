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


