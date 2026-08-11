"""
Iveco CRM — Müşteri İstihbarat + Satış Operasyon Platformu
FastAPI Application Entry Point
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables, SessionLocal
from app.core.security import get_password_hash


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup: create tables and seed data
    create_all_tables()
    _seed_initial_data()
    os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Iveco bayisi için müşteri istihbarat ve satış operasyon platformu",
    lifespan=lifespan,
)

# CORS configuration (handles * wildcard dynamically)
origins = settings.cors_origins_list
allow_credentials = True
if "*" in origins or "" in origins:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routers ─────────────────────────────────────────────

from app.modules.auth.router import router as auth_router
from app.modules.crm.router import router as crm_router
from app.modules.discovery.router import router as discovery_router
from app.modules.enrichment.router import router as enrichment_router
from app.modules.notifications.router import router as notifications_router
from app.modules.campaigns.router import router as campaigns_router
from app.modules.sales_activity.router import router as sales_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.scanner.router import router as scanner_router

app.include_router(auth_router)
app.include_router(crm_router)
app.include_router(discovery_router)
app.include_router(enrichment_router)
app.include_router(notifications_router)
app.include_router(campaigns_router)
app.include_router(sales_router)
app.include_router(dashboard_router)
app.include_router(scanner_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


def _seed_initial_data():
    """Create default admin user and demo data if database is empty."""
    from app.modules.auth.models import User
    from app.modules.discovery.models import DiscoverySource
    from app.modules.sales_activity.models import MessageTemplate

    db = SessionLocal()
    try:
        # Create admin user if no users exist
        if db.query(User).count() == 0:
            admin = User(
                email="admin@iveco-crm.local",
                hashed_password=get_password_hash("admin123"),
                full_name="Sistem Yöneticisi",
                role="admin",
            )
            sales_rep = User(
                email="satis@iveco-crm.local",
                hashed_password=get_password_hash("satis123"),
                full_name="Satış Temsilcisi",
                role="sales_rep",
            )
            db.add_all([admin, sales_rep])
            db.commit()

        # Create demo discovery source
        if db.query(DiscoverySource).count() == 0:
            sources = [
                DiscoverySource(
                    name="Orta Karadeniz Ticaret Odaları",
                    source_type="trade_chamber",
                    url="https://www.stso.org.tr",
                    scraper_class="demo_source.OrtaKaradenizDemoScraper",
                    schedule_cron="0 2 * * *",
                ),
                DiscoverySource(
                    name="Lojistik Firma Rehberi",
                    source_type="logistics_dir",
                    url="https://www.lojistikrehberi.com",
                    scraper_class="demo_source.OrtaKaradenizDemoScraper",
                    schedule_cron="0 3 * * 1",
                ),
                DiscoverySource(
                    name="Nakliye Dizini",
                    source_type="transport_dir",
                    url="https://www.nakliyeciler.com",
                    scraper_class="demo_source.OrtaKaradenizDemoScraper",
                    schedule_cron="0 4 * * 3",
                ),
            ]
            db.add_all(sources)
            db.commit()

        # Create message templates
        if db.query(MessageTemplate).count() == 0:
            templates = [
                MessageTemplate(
                    name="İlk Tanışma",
                    content="Merhaba, Iveco yetkili bayisi olarak sizinle tanışmak isteriz. Ticari araç ihtiyaçlarınız konusunda size en uygun çözümleri sunabiliriz. Görüşme için uygun zamanınızı öğrenebilir miyiz?",
                    category="introduction",
                ),
                MessageTemplate(
                    name="Katalog Gönderimi",
                    content="Merhaba, Iveco {model} kataloğumuzu sizinle paylaşmak istiyoruz. Detaylı bilgi ve teklif için bize ulaşabilirsiniz.",
                    category="catalog",
                ),
                MessageTemplate(
                    name="Kampanya Bildirimi",
                    content="Merhaba, Iveco {model} araçlarda özel kampanya fırsatlarımız başlamıştır. Detaylı bilgi almak ister misiniz?",
                    category="offer",
                ),
                MessageTemplate(
                    name="Takip Mesajı",
                    content="Merhaba, geçtiğimiz günlerde görüştüğümüz Iveco {model} teklifi hakkında bir gelişme var mı? Size yardımcı olabileceğimiz bir konu varsa memnuniyetle bilgi veririz.",
                    category="follow_up",
                ),
                MessageTemplate(
                    name="Stok Araç Bilgisi",
                    content="Merhaba, hemen teslim stok araçlarımız hakkında bilgi vermek istiyoruz. Mevcut stok listemizi incelemek ister misiniz?",
                    category="offer",
                ),
            ]
            db.add_all(templates)
            db.commit()

    finally:
        db.close()
