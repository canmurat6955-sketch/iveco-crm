"""
Dashboard API: aggregates data from all modules for the main dashboard view.
Includes analytics, geo-data, and trend endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from datetime import date, datetime, timezone, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.crm.models import Customer
from app.modules.discovery.models import DiscoveredCompany
from app.modules.sales_activity.models import SalesActivity
from app.modules.campaigns.models import Campaign
from app.modules.notifications.models import Notification

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Ana dashboard verileri."""
    today = date.today()
    total_customers = db.query(Customer).filter(Customer.is_active == True).count()
    high_potential = db.query(Customer).filter(
        Customer.is_active == True,
        Customer.potential_level.in_(["very_high", "high"])
    ).count()
    new_discoveries = db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "new").count()
    enriched_discoveries = db.query(DiscoveredCompany).filter(
        DiscoveredCompany.status == "enriched", DiscoveredCompany.enrichment_score >= 40,
    ).count()
    pipeline = {}
    for status_name in ["sent", "replied", "offer_given", "follow_up", "hot_lead", "converted", "lost"]:
        pipeline[status_name] = db.query(SalesActivity).filter(SalesActivity.status == status_name).count()
    today_follow_ups = db.query(SalesActivity).filter(
        SalesActivity.next_follow_up <= today,
        SalesActivity.status.notin_(["converted", "lost"]),
    ).count()
    active_campaigns = db.query(Campaign).filter(Campaign.is_active == True).count()
    unread_notifs = db.query(Notification).filter(
        ((Notification.user_id == current_user.id) | (Notification.user_id.is_(None))),
        Notification.is_read == False,
    ).count()

    return {
        "total_customers": total_customers,
        "high_potential_customers": high_potential,
        "new_discoveries": new_discoveries,
        "enriched_high_score": enriched_discoveries,
        "today_follow_ups": today_follow_ups,
        "active_campaigns": active_campaigns,
        "unread_notifications": unread_notifs,
        "pipeline": pipeline,
    }


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Kapsamlı analitik veriler — grafikler için."""
    # City distribution
    city_rows = db.query(Customer.city, func.count(Customer.id)).filter(
        Customer.is_active == True, Customer.city.isnot(None)
    ).group_by(Customer.city).order_by(desc(func.count(Customer.id))).all()
    city_distribution = [{"name": c or "Belirtilmemiş", "value": v} for c, v in city_rows]

    # Sector breakdown
    sector_rows = db.query(Customer.sector, func.count(Customer.id)).filter(
        Customer.is_active == True, Customer.sector.isnot(None)
    ).group_by(Customer.sector).order_by(desc(func.count(Customer.id))).limit(10).all()
    sector_breakdown = [{"name": s or "Diğer", "value": v} for s, v in sector_rows]

    # Source breakdown
    source_rows = db.query(Customer.source, func.count(Customer.id)).filter(
        Customer.is_active == True
    ).group_by(Customer.source).all()
    source_breakdown = [{"name": s or "manual", "value": v} for s, v in source_rows]

    # Segment distribution
    segment_rows = db.query(Customer.segment, func.count(Customer.id)).filter(
        Customer.is_active == True
    ).group_by(Customer.segment).all()
    segment_distribution = [{"name": s or "C", "value": v} for s, v in segment_rows]

    # Potential distribution
    potential_rows = db.query(Customer.potential_level, func.count(Customer.id)).filter(
        Customer.is_active == True
    ).group_by(Customer.potential_level).all()
    potential_distribution = [{"name": p or "medium", "value": v} for p, v in potential_rows]

    # Discovery status breakdown
    disc_rows = db.query(DiscoveredCompany.status, func.count(DiscoveredCompany.id)).group_by(
        DiscoveredCompany.status
    ).all()
    discovery_status = [{"name": s, "value": v} for s, v in disc_rows]

    # Monthly trend (last 6 months)
    monthly_trend = []
    for i in range(5, -1, -1):
        month_start = (date.today().replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        if i > 0:
            next_month = (month_start + timedelta(days=32)).replace(day=1)
        else:
            next_month = date.today() + timedelta(days=1)
        count = db.query(Customer).filter(
            Customer.created_at >= datetime.combine(month_start, datetime.min.time()),
            Customer.created_at < datetime.combine(next_month, datetime.min.time()),
        ).count()
        monthly_trend.append({
            "month": month_start.strftime("%Y-%m"),
            "label": month_start.strftime("%b"),
            "count": count,
        })

    return {
        "city_distribution": city_distribution,
        "sector_breakdown": sector_breakdown,
        "source_breakdown": source_breakdown,
        "segment_distribution": segment_distribution,
        "potential_distribution": potential_distribution,
        "discovery_status": discovery_status,
        "monthly_trend": monthly_trend,
    }


@router.get("/geo-data")
def get_geo_data(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Bölge haritası verisi — her şehir için müşteri ve keşif sayıları."""
    GEO_COORDS = {
        "Samsun": {"lat": 41.2867, "lng": 36.33},
        "Amasya": {"lat": 40.6499, "lng": 35.8353},
        "Tokat": {"lat": 40.3167, "lng": 36.5544},
        "Çorum": {"lat": 40.5506, "lng": 34.9556},
        "Ordu": {"lat": 40.984, "lng": 37.8764},
        "Sinop": {"lat": 42.0231, "lng": 35.1531},
    }
    result = []
    for city_name, coords in GEO_COORDS.items():
        cust_count = db.query(Customer).filter(Customer.city == city_name, Customer.is_active == True).count()
        disc_count = db.query(DiscoveredCompany).filter(DiscoveredCompany.city == city_name).count()
        avg_score = db.query(func.avg(Customer.potential_score)).filter(
            Customer.city == city_name, Customer.is_active == True
        ).scalar() or 0
        top_sectors = db.query(Customer.sector, func.count(Customer.id)).filter(
            Customer.city == city_name, Customer.is_active == True, Customer.sector.isnot(None)
        ).group_by(Customer.sector).order_by(desc(func.count(Customer.id))).limit(3).all()

        result.append({
            "city": city_name, **coords,
            "customers": cust_count, "discoveries": disc_count,
            "avg_score": round(float(avg_score), 1),
            "top_sectors": [s for s, _ in top_sectors],
        })
    return result


@router.get("/today-calls")
def today_calls(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Bugün aranacak müşteriler."""
    today = date.today()
    activities = (
        db.query(SalesActivity)
        .filter(SalesActivity.next_follow_up <= today, SalesActivity.status.notin_(["converted", "lost"]))
        .order_by(SalesActivity.next_follow_up)
        .limit(20).all()
    )
    result = []
    for a in activities:
        customer = db.query(Customer).filter(Customer.id == a.customer_id).first()
        if customer:
            result.append({
                "activity_id": a.id, "customer_id": customer.id,
                "customer_name": customer.company_name, "city": customer.city,
                "phone": customer.phone, "status": a.status,
                "next_follow_up": str(a.next_follow_up), "notes": a.notes,
            })
    return result


@router.get("/new-discoveries")
def new_discoveries(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Son keşfedilen firmalar."""
    companies = (
        db.query(DiscoveredCompany)
        .filter(DiscoveredCompany.status.in_(["new", "enriched"]))
        .order_by(desc(DiscoveredCompany.discovered_at))
        .limit(10).all()
    )
    return [
        {"id": c.id, "company_name": c.company_name, "city": c.city,
         "district": c.district, "sector": c.sector, "score": c.enrichment_score,
         "status": c.status, "discovered_at": str(c.discovered_at)}
        for c in companies
    ]


@router.get("/high-potential")
def high_potential(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Yüksek potansiyelli firmalar."""
    companies = (
        db.query(DiscoveredCompany)
        .filter(DiscoveredCompany.enrichment_score >= 55, DiscoveredCompany.status != "rejected")
        .order_by(desc(DiscoveredCompany.enrichment_score))
        .limit(10).all()
    )
    return [
        {"id": c.id, "company_name": c.company_name, "city": c.city,
         "sector": c.sector, "score": c.enrichment_score,
         "status": c.status, "activity": c.activity_description}
        for c in companies
    ]


@router.get("/pending-responses")
def pending_responses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Cevap bekleyenler."""
    activities = (
        db.query(SalesActivity)
        .filter(SalesActivity.status.in_(["sent", "follow_up"]))
        .order_by(desc(SalesActivity.created_at))
        .limit(10).all()
    )
    result = []
    for a in activities:
        customer = db.query(Customer).filter(Customer.id == a.customer_id).first()
        result.append({
            "activity_id": a.id, "customer_id": a.customer_id,
            "customer_name": customer.company_name if customer else "?",
            "activity_type": a.activity_type, "status": a.status,
            "created_at": str(a.created_at),
        })
    return result


@router.get("/recent-campaigns")
def recent_campaigns(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Son yüklenen kampanyalar."""
    campaigns = (
        db.query(Campaign).filter(Campaign.is_active == True)
        .order_by(desc(Campaign.created_at)).limit(5).all()
    )
    return [
        {"id": c.id, "title": c.title, "category": c.category,
         "validity_end": str(c.validity_end) if c.validity_end else None,
         "created_at": str(c.created_at)}
        for c in campaigns
    ]


@router.get("/pipeline")
def pipeline_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Satış pipeline özeti."""
    statuses = dict(
        db.query(SalesActivity.status, func.count(SalesActivity.id))
        .group_by(SalesActivity.status).all()
    )
    return {
        "sent": statuses.get("sent", 0), "replied": statuses.get("replied", 0),
        "offer_given": statuses.get("offer_given", 0), "follow_up": statuses.get("follow_up", 0),
        "hot_lead": statuses.get("hot_lead", 0), "converted": statuses.get("converted", 0),
        "lost": statuses.get("lost", 0), "total": sum(statuses.values()),
    }
