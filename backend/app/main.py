"""
Iveco CRM — Müşteri İstihbarat + Satış Operasyon Platformu
FastAPI Application Entry Point
"""
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import create_all_tables, SessionLocal
from app.core.security import get_password_hash


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup: create tables and seed data
    import app.modules.auth.models
    import app.modules.crm.models
    import app.modules.sales_activity.models
    import app.modules.discovery.models
    import app.modules.campaigns.models
    import app.modules.notifications.models
    import app.modules.vehicles.models
    import app.modules.contacts.models
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

# CORS configuration: allows localhost, Vercel deployments, Render, and custom configured origins
configured_origins = settings.cors_origins_list
origins = configured_origins if configured_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|.*\.vercel\.app|.*\.onrender\.com)(:\d+)?",
    allow_credentials=True,
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
from app.modules.vehicles.router import router as vehicles_router
from app.modules.contacts.router import router as contacts_router
from app.modules.workbench.router import router as workbench_router

app.include_router(auth_router)
app.include_router(crm_router)
app.include_router(discovery_router)
app.include_router(enrichment_router)
app.include_router(notifications_router)
app.include_router(campaigns_router)
app.include_router(sales_router)
app.include_router(dashboard_router)
app.include_router(scanner_router)
app.include_router(vehicles_router)
app.include_router(contacts_router)
app.include_router(workbench_router)

# Yanıtları sıkıştır (mobil veri ve hız için)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Mount static file uploads (photos, cards, docs)
os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.FILE_STORAGE_PATH), name="uploads")


@app.get("/api/health")
def health_check():
    from app.core.database import storage_status
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "storage": storage_status(),
        "google_places": bool(settings.GOOGLE_MAPS_API_KEY and settings.GOOGLE_MAPS_API_KEY != "MOCK_GOOGLE_MAPS_API_KEY"),
        "secret_key_default": settings.SECRET_KEY == "iveco-crm-secret-key-change-in-production",
    }


# ── Derlenmiş arayüzü (frontend/dist) doğrudan backend'den sun ─────────
# Böylece tek süreç yeterli olur; hash'li dosyalar 1 yıl önbelleğe alınır, index.html hiç alınmaz.
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    @app.middleware("http")
    async def cache_headers(request: Request, call_next):
        response = await call_next(request)
        p = request.url.path
        if p.startswith("/assets/"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif not p.startswith("/api") and not p.startswith("/uploads"):
            response.headers["Cache-Control"] = "no-cache"
        return response

    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Bulunamadı")
        candidate = (FRONTEND_DIST / full_path).resolve()
        if full_path and candidate.is_file() and FRONTEND_DIST in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")


def _seed_initial_data():
    """Create default admin user and demo data if database is empty."""
    from app.modules.auth.models import User
    from app.modules.discovery.models import DiscoverySource
    from app.modules.sales_activity.models import MessageTemplate

    db = SessionLocal()
    try:
        # Varsayılan kullanıcılar yoksa oluştur (mevcut şifreler artık her açılışta SIFIRLANMAZ)
        admin = db.query(User).filter(User.email == "admin@iveco-crm.local").first()
        if not admin:
            admin = User(
                email="admin@iveco-crm.local",
                hashed_password=get_password_hash(os.environ.get("INITIAL_ADMIN_PASSWORD", "erccrm")),
                full_name="Sistem Yöneticisi",
                role="admin",
                is_active=True,
            )
            db.add(admin)

        sales_rep = db.query(User).filter(User.email == "satis@iveco-crm.local").first()
        if not sales_rep:
            sales_rep = User(
                email="satis@iveco-crm.local",
                hashed_password=get_password_hash(os.environ.get("INITIAL_ADMIN_PASSWORD", "erccrm")),
                full_name="King Temsilcisi",
                role="sales_rep",
                is_active=True,
            )
            db.add(sales_rep)

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

        # Seed Vehicle Master Data
        from app.modules.vehicles.service import VehicleService
        VehicleService(db).seed_master_data()

        # Seed Banka Çatı Finansman Matrisleri (L&M ve HEAVY)
        from app.modules.campaigns.models import FinancingMatrix
        import json
        if db.query(FinancingMatrix).count() == 0:
            fm_seeds = [
                FinancingMatrix(
                    bank_name="Kuveyt Türk",
                    vehicle_group="light_medium",
                    campaign_name="6 Ay Ödemesiz - Bayi Katkılı",
                    applicable_models="Daily 35 Şasi & Daily Van",
                    validity_period="Eylül - Ekim 2026",
                    is_active=True,
                    notes="Daily 35 Şasi ve Van modelleri için ilk 6 ay ödemesiz taksitli kampanya.",
                    tiers_json=json.dumps([
                        {
                            "principal": 1000000,
                            "formatted_principal": "1.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 62390, "total_payment": 1497371, "rate": "%2.21"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 48808, "total_payment": 1757097, "rate": "%2.40"}
                            ]
                        },
                        {
                            "principal": 1500000,
                            "formatted_principal": "1.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 98972, "total_payment": 2375326, "rate": "%2.55"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 77336, "total_payment": 2784087, "rate": "%2.67"}
                            ]
                        },
                        {
                            "principal": 2000000,
                            "formatted_principal": "2.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 135609, "total_payment": 3254612, "rate": "%2.72"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 106012, "total_payment": 3816417, "rate": "%2.81"}
                            ]
                        },
                        {
                            "principal": 2500000,
                            "formatted_principal": "2.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 171949, "total_payment": 4126777, "rate": "%2.81"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 134602, "total_payment": 4845677, "rate": "%2.89"}
                            ]
                        },
                        {
                            "principal": 3000000,
                            "formatted_principal": "3.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 208629, "total_payment": 5007089, "rate": "%2.88"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 163089, "total_payment": 5871211, "rate": "%2.94"}
                            ]
                        }
                    ], ensure_ascii=False)
                ),
                FinancingMatrix(
                    bank_name="Kuveyt Türk",
                    vehicle_group="light_medium",
                    campaign_name="Daily 70C & Eurocargo - 6 Ay Ödemesiz",
                    applicable_models="Daily 70C, Eurocargo",
                    validity_period="Eylül - Ekim 2026",
                    is_active=True,
                    notes="Daily 70C ve Eurocargo modellerinde 6 ay ödemesiz bayi katkılı kampanya.",
                    tiers_json=json.dumps([
                        {
                            "principal": 1000000,
                            "formatted_principal": "1.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 58394, "total_payment": 1401459, "rate": "%1.33"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 45731, "total_payment": 1646317, "rate": "%1.78"}
                            ]
                        },
                        {
                            "principal": 1500000,
                            "formatted_principal": "1.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 95315, "total_payment": 2287561, "rate": "%2.01"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 74579, "total_payment": 2684829, "rate": "%2.15"}
                            ]
                        },
                        {
                            "principal": 2000000,
                            "formatted_principal": "2.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 132176, "total_payment": 3172216, "rate": "%2.20"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 103526, "total_payment": 3726932, "rate": "%2.32"}
                            ]
                        },
                        {
                            "principal": 2500000,
                            "formatted_principal": "2.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 168972, "total_payment": 4055318, "rate": "%2.35"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 132254, "total_payment": 4761152, "rate": "%2.45"}
                            ]
                        }
                    ], ensure_ascii=False)
                ),
                FinancingMatrix(
                    bank_name="Denizbank",
                    vehicle_group="light_medium",
                    campaign_name="Çatı Anlaşması Standart Kampanya",
                    applicable_models="Daily 35 Şasi & Panelvan",
                    validity_period="Eylül - Ekim 2026",
                    is_active=True,
                    notes="Denizbank ticari taşıt kredisi bayi anlaşmalı avantajlı oranlar.",
                    tiers_json=json.dumps([
                        {
                            "principal": 1000000,
                            "formatted_principal": "1.000.000 TL",
                            "terms": [
                                {"months": 12, "grace_months": 0, "monthly_payment": 89000, "total_payment": 1068000, "rate": "%0.98"},
                                {"months": 24, "grace_months": 0, "monthly_payment": 52300, "total_payment": 1255200, "rate": "%1.86"},
                                {"months": 36, "grace_months": 0, "monthly_payment": 41100, "total_payment": 1479600, "rate": "%2.20"}
                            ]
                        },
                        {
                            "principal": 1500000,
                            "formatted_principal": "1.500.000 TL",
                            "terms": [
                                {"months": 12, "grace_months": 0, "monthly_payment": 135000, "total_payment": 1620000, "rate": "%1.10"},
                                {"months": 24, "grace_months": 0, "monthly_payment": 79500, "total_payment": 1908000, "rate": "%1.95"},
                                {"months": 36, "grace_months": 0, "monthly_payment": 62800, "total_payment": 2260800, "rate": "%2.30"}
                            ]
                        },
                        {
                            "principal": 2000000,
                            "formatted_principal": "2.000.000 TL",
                            "terms": [
                                {"months": 12, "grace_months": 0, "monthly_payment": 180000, "total_payment": 2160000, "rate": "%1.25"},
                                {"months": 24, "grace_months": 0, "monthly_payment": 106000, "total_payment": 2544000, "rate": "%2.05"},
                                {"months": 36, "grace_months": 0, "monthly_payment": 83500, "total_payment": 3006000, "rate": "%2.38"}
                            ]
                        }
                    ], ensure_ascii=False)
                ),
                FinancingMatrix(
                    bank_name="Kuveyt Türk",
                    vehicle_group="heavy",
                    campaign_name="S-Way & T-Way - 6 Ay Ödemesiz",
                    applicable_models="S-Way Çekici, T-Way, X-Way",
                    validity_period="Eylül - Ekim 2026",
                    is_active=True,
                    notes="Ağır vasıta S-Way ve T-Way için 6 ay ödemesiz filo ve bayi katkılı finansman.",
                    tiers_json=json.dumps([
                        {
                            "principal": 2000000,
                            "formatted_principal": "2.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 132000, "total_payment": 3168000, "rate": "%2.10"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 103000, "total_payment": 3708000, "rate": "%2.25"}
                            ]
                        },
                        {
                            "principal": 3000000,
                            "formatted_principal": "3.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 198000, "total_payment": 4752000, "rate": "%2.20"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 154500, "total_payment": 5562000, "rate": "%2.35"}
                            ]
                        },
                        {
                            "principal": 4000000,
                            "formatted_principal": "4.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 264000, "total_payment": 6336000, "rate": "%2.25"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 206000, "total_payment": 7416000, "rate": "%2.40"}
                            ]
                        },
                        {
                            "principal": 5000000,
                            "formatted_principal": "5.000.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 6, "monthly_payment": 330000, "total_payment": 7920000, "rate": "%2.30"},
                                {"months": 36, "grace_months": 6, "monthly_payment": 257500, "total_payment": 9270000, "rate": "%2.45"}
                            ]
                        }
                    ], ensure_ascii=False)
                ),
                FinancingMatrix(
                    bank_name="Garanti BBVA",
                    vehicle_group="heavy",
                    campaign_name="S-Way Çekici Avantajlı Finansman",
                    applicable_models="IVECO S-Way 530 / 570",
                    validity_period="Eylül - Ekim 2026",
                    is_active=True,
                    notes="S-Way uzun yol çekici alımlarında Garanti BBVA çatı finansman desteği.",
                    tiers_json=json.dumps([
                        {
                            "principal": 2500000,
                            "formatted_principal": "2.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 0, "monthly_payment": 142000, "total_payment": 3408000, "rate": "%2.15"},
                                {"months": 36, "grace_months": 0, "monthly_payment": 112000, "total_payment": 4032000, "rate": "%2.35"}
                            ]
                        },
                        {
                            "principal": 3500000,
                            "formatted_principal": "3.500.000 TL",
                            "terms": [
                                {"months": 24, "grace_months": 0, "monthly_payment": 198000, "total_payment": 4752000, "rate": "%2.20"},
                                {"months": 36, "grace_months": 0, "monthly_payment": 156000, "total_payment": 5616000, "rate": "%2.40"}
                            ]
                        }
                    ], ensure_ascii=False)
                )
            ]
            db.add_all(fm_seeds)
            db.commit()

        # Seed Demo Filo Araçları (Filo Yaşam Döngüsü & Yenileme Radarı için)
        from app.modules.crm.models import Customer, CustomerFleetVehicle
        if db.query(CustomerFleetVehicle).count() == 0:
            top_customers = db.query(Customer).order_by(Customer.id).limit(5).all()

            if top_customers:
                fleet_seeds = [
                    CustomerFleetVehicle(
                        customer_id=top_customers[0].id,
                        brand="Ford",
                        model="Transit 350L",
                        model_year=2020,
                        plate_number="55 ABC 421",
                        body_type="Kapalı Kasa",
                        mileage=215000,
                        notes="Yüksek km, motor rektifiye ve ağır bakım periyodunda. Daily 35C teklif edilmeli."
                    ),
                    CustomerFleetVehicle(
                        customer_id=top_customers[0].id,
                        brand="Mercedes-Benz",
                        model="Sprinter 316",
                        model_year=2019,
                        plate_number="55 AZ 882",
                        body_type="Panelvan",
                        mileage=260000,
                        notes="Garanti bitti, servis maliyeti yüksek. Daily Panelvan veya 35C Şasi alternatifi."
                    ),
                    CustomerFleetVehicle(
                        customer_id=top_customers[1].id if len(top_customers) > 1 else top_customers[0].id,
                        brand="Ford",
                        model="Cargo 1833",
                        model_year=2021,
                        plate_number="55 DF 109",
                        body_type="Damper Kasa",
                        mileage=185000,
                        notes="Hafriyat ve şantiye aracı, aşınma yüksek. T-Way veya Eurocargo önerilecek."
                    ),
                    CustomerFleetVehicle(
                        customer_id=top_customers[3].id if len(top_customers) > 3 else top_customers[0].id,
                        brand="Isuzu",
                        model="NPR 3D",
                        model_year=2020,
                        plate_number="55 KL 603",
                        body_type="Açık Kasa",
                        mileage=198000,
                        notes="İnşaat malzemesi nakliyesi. Daily 72C (4100 mm) veya Eurocargo ML120E değişimi için ideal."
                    ),
                    CustomerFleetVehicle(
                        customer_id=top_customers[4].id if len(top_customers) > 4 else top_customers[0].id,
                        brand="Iveco",
                        model="Daily 35C15",
                        model_year=2022,
                        plate_number="55 FR 310",
                        body_type="Frigorifik Kasa",
                        mileage=168000,
                        notes="3. yıl dolumu, soğuk zincir lojistiği. Yeni Daily 70C / 72C Frigo büyüme teklifi."
                    ),
                ]
                db.add_all(fleet_seeds)
                db.commit()

        # Seed WhatsApp Kampanya Gönderilen & Okunan 14 Samsun Nakliyat/Ambar Firması
        from datetime import datetime, timezone, date, timedelta
        import re
        from app.modules.crm.models import Customer, CustomerContact, CustomerInteraction
        from app.modules.vehicles.models import VehicleMaster, CustomerVehicleInterest
        from app.modules.sales_activity.models import SalesActivity, WhatsAppMessage
        from app.modules.campaigns.models import Campaign
        from app.modules.contacts.models import PersonalContact

        # Ensure sales_rep name is Can Murat Onay
        sales_rep = db.query(User).filter(User.email == "satis@iveco-crm.local").first()
        if sales_rep and sales_rep.full_name != "Can Murat Onay":
            sales_rep.full_name = "Can Murat Onay"
            db.add(sales_rep)
            db.commit()

        # 1. Kuveyt Türk Daily 6 Ay Ödemesiz Kampanyası (Campaign tablosu)
        daily_campaign = db.query(Campaign).filter(
            Campaign.title.ilike("%Kuveyt Türk 6 Ay Ödemesiz%Daily%")
        ).first()
        if not daily_campaign:
            daily_campaign = Campaign(
                title="Kuveyt Türk 6 Ay Ödemesiz - Daily Şasi Kampanyası",
                category="finance_campaign",
                description="Daily 35 Şasi ve Van modelleri için ilk 6 ay ödemesiz Kuveyt Türk bayi katkılı finansman kampanyası (1M-3M TL, 24 ve 36 ay vadeli).",
                file_path=os.path.join(settings.FILE_STORAGE_PATH, "campaigns", "kuveyt_turk_daily_6ay.png") if os.path.exists(os.path.join(settings.FILE_STORAGE_PATH, "campaigns", "kuveyt_turk_daily_6ay.png")) else None,
                file_name="kuveyt_turk_daily_6ay.png",
                file_type="image/png",
                validity_start=date(2026, 9, 1),
                validity_end=date(2026, 11, 30),
                version="2026-Q4",
                is_active=True,
                uploaded_by_id=sales_rep.id if sales_rep else 1,
            )
            db.add(daily_campaign)
            db.commit()
            db.refresh(daily_campaign)

        # 2. Daily 35C16 Şasi Kamyonet Master Vehicle
        daily_master_vehicle = db.query(VehicleMaster).filter(
            VehicleMaster.vehicle_group == "Daily",
            VehicleMaster.model_code == "35C16",
            VehicleMaster.vehicle_sub_group.ilike("%Şasi%")
        ).first()

        campaign_companies = [
            {
                "company_name": "Temel Nakliyat Samsun Ambarı",
                "contact_name": "Temel Bey",
                "phone": "0532 555 10 14",
                "district": "İlkadım (Ambarlar)",
                "address": "Ambarlar Sitesi No: 14, İlkadım / Samsun",
                "sector": "Ambar & Taşımacılık",
                "hour": 10, "minute": 14,
            },
            {
                "company_name": "SHL Sahil Lojistik (Samsun Şubesi)",
                "contact_name": "Şahin Bey",
                "phone": "0533 555 10 13",
                "district": "Tekkeköy (Lojistik Köy)",
                "address": "Samsun Lojistik Köyü B Blok No: 12, Tekkeköy / Samsun",
                "sector": "Ulusal & Bölgesel Lojistik",
                "hour": 10, "minute": 13,
            },
            {
                "company_name": "Anadolu Ambarı Samsun Hattı",
                "contact_name": "Kemal Bey",
                "phone": "0535 555 10 13",
                "district": "İlkadım",
                "address": "Kıran Mah. Ambarlar Cad. No: 8, İlkadım / Samsun",
                "sector": "Ambar & Parça Yük Taşımacılığı",
                "hour": 10, "minute": 13,
            },
            {
                "company_name": "Samsun Lojistik Center",
                "contact_name": "Filo Müdürü",
                "phone": "0542 555 10 12",
                "district": "Tekkeköy",
                "address": "Lojistik Center Tesisleri, Tekkeköy / Samsun",
                "sector": "Depolama & Dağıtım Lojistiği",
                "hour": 10, "minute": 12,
            },
            {
                "company_name": "Öncü Nakliyat & Ambar Hizmetleri",
                "contact_name": "Murat Bey",
                "phone": "0530 555 10 12",
                "district": "Canik",
                "address": "Eski Sanayi Sitesi 24. Sok. No: 5, Canik / Samsun",
                "sector": "Şehirlerarası Nakliyat & Ambar",
                "hour": 10, "minute": 12,
            },
            {
                "company_name": "Körfez Parça Eşya Taşım",
                "contact_name": "Hüseyin Bey",
                "phone": "0544 555 10 06",
                "district": "Atakum / Körfez",
                "address": "Körfez Mah. Atatürk Bulvarı No: 142, Atakum / Samsun",
                "sector": "Parça Eşya & Şehir İçi Dağıtım",
                "hour": 10, "minute": 6,
            },
            {
                "company_name": "Terme Can Nakliyat",
                "contact_name": "Can Bey",
                "phone": "0536 555 10 05",
                "district": "Terme",
                "address": "Sanayi Mah. Çarşamba Yolu Üzeri No: 45, Terme / Samsun",
                "sector": "Tarım Ürünleri & Ağır Nakliyat",
                "hour": 10, "minute": 5,
            },
            {
                "company_name": "Atakum Nakliyat",
                "contact_name": "Erkan Bey",
                "phone": "0546 555 10 04",
                "district": "Atakum",
                "address": "Mimar Sinan Mah. İsmet İnönü Bulv. No: 88, Atakum / Samsun",
                "sector": "Evden Eve & Ofis Taşımacılığı",
                "hour": 10, "minute": 4,
            },
            {
                "company_name": "Gümüşay Nakliyat Samsun",
                "contact_name": "Gümüşay Yetkilisi",
                "phone": "0537 555 10 04",
                "district": "İlkadım",
                "address": "Zafer Mah. Şevket Dingil Sok. No: 11, İlkadım / Samsun",
                "sector": "Şehirlerarası Parça & Komple Taşımacılık",
                "hour": 10, "minute": 4,
            },
            {
                "company_name": "Samsun Özgüray Nakliyat",
                "contact_name": "Özgür Bey",
                "phone": "0538 555 10 03",
                "district": "Canik",
                "address": "Kuzey Sanayi Sitesi 32. Blok No: 7, Canik / Samsun",
                "sector": "Ambar & Lojistik Dağıtım",
                "hour": 10, "minute": 3,
            },
            {
                "company_name": "Kılıç Ege Nakliyat",
                "contact_name": "Kılıç Bey",
                "phone": "0541 445 95 85",
                "district": "Tekkeköy",
                "address": "Organize Sanayi Bölgesi 12. Cad. No: 19, Tekkeköy / Samsun",
                "sector": "Ege & Akdeniz Hattı Taşımacılık",
                "hour": 10, "minute": 1,
            },
            {
                "company_name": "Kılıç Ege Nakliyat & Lojistik",
                "contact_name": "Kılıçlar Filo Sorumlusu",
                "phone": "0538 280 40 87",
                "district": "Tekkeköy",
                "address": "Samsun Lojistik Köyü D Blok No: 4, Tekkeköy / Samsun",
                "sector": "Filo Lojistik & Parsiyel Taşıma",
                "hour": 10, "minute": 1,
            },
            {
                "company_name": "Kenan Aydın Sinan Aydın Samtaş Nakliye Rehberim",
                "contact_name": "Kenan Aydın / Sinan Aydın",
                "phone": "0532 334 08 73",
                "district": "Canik",
                "address": "Güdül Sanayi Sitesi Nakliyeciler Sitesi No: 23, Canik / Samsun",
                "sector": "Samsun - Marmara Düzenli Sefer & Ağır Nakliyat",
                "hour": 10, "minute": 1,
            },
            {
                "company_name": "Samsun Öz Samtaş Ambarı",
                "contact_name": "Samtaş Ambar Müdürü",
                "phone": "0362 266 55 01",
                "district": "Canik (Doğu Sanayi)",
                "address": "Doğu Sanayi Sitesi 15. Sok. No: 18, Canik / Samsun",
                "sector": "Ambar Kargo & Parsiyel Nakliyat",
                "hour": 10, "minute": 1,
            },
        ]

        outreach_msg = (
            "Ben IVECO ERC Samsun Otomotiv Satış Sorumlusu Can Murat Onay (0544 622 59 31). "
            "Sizin için hazırladığımız avantajlı IVECO Daily Şasi kampanyamızı sizinle paylaşmak istedim. "
            "Düşünürseniz detayları ve araç özelliklerini görüşmekten memnuniyet duyarım."
        )

        rep_id = sales_rep.id if sales_rep else 1

        for c_data in campaign_companies:
            cust = db.query(Customer).filter(Customer.company_name == c_data["company_name"]).first()
            if not cust:
                cust = Customer(
                    company_name=c_data["company_name"],
                    phone=c_data["phone"],
                    city="Samsun",
                    district=c_data["district"],
                    address=c_data["address"],
                    sector=c_data["sector"],
                    pipeline_stage="proposal",
                    pipeline_note="Kuveyt Türk 6 Ay Ödemesiz Daily Şasi Kampanyası Gönderildi (Okundu)",
                    segment="B",
                    potential_score=80,
                    potential_level="high",
                    last_contact_date=date(2026, 10, 20),
                    source="whatsapp_campaign",
                    is_active=True,
                    assigned_to_id=rep_id,
                )
                db.add(cust)
                db.commit()
                db.refresh(cust)
            else:
                cust.pipeline_stage = "proposal"
                cust.pipeline_note = "Kuveyt Türk 6 Ay Ödemesiz Daily Şasi Kampanyası Gönderildi (Okundu)"
                cust.segment = cust.segment or "B"
                cust.potential_score = max(cust.potential_score or 0, 80)
                cust.last_contact_date = date(2026, 10, 20)
                db.add(cust)
                db.commit()

            # Contact
            contact = db.query(CustomerContact).filter(CustomerContact.customer_id == cust.id).first()
            if not contact:
                contact = CustomerContact(
                    customer_id=cust.id,
                    contact_name=c_data["contact_name"],
                    role="Firma Yetkilisi",
                    phone=c_data["phone"],
                    is_primary=True,
                )
                db.add(contact)
                db.commit()

            # Personal Contact sync (if existing)
            pc = db.query(PersonalContact).filter(
                (PersonalContact.full_name.ilike(f"%{c_data['company_name'][:12]}%")) |
                (PersonalContact.phone == c_data["phone"])
            ).first()
            if pc and not pc.converted_customer_id:
                pc.converted_customer_id = cust.id
                db.add(pc)
                db.commit()

            # Vehicle Interest
            if daily_master_vehicle:
                vi = db.query(CustomerVehicleInterest).filter(CustomerVehicleInterest.customer_id == cust.id).first()
                if not vi:
                    vi = CustomerVehicleInterest(
                        customer_id=cust.id,
                        vehicle_id=daily_master_vehicle.id,
                        interest_level="high",
                        purchase_timeframe="0_30_days",
                        estimated_quantity=1,
                        customer_note="Kuveyt Türk 6 Ay Ödemesiz Bayi Katkılı Kampanyası iletildi. Daily 35C16 Şasi Kamyonet ilgisi.",
                        opportunity_status="open",
                        created_by=rep_id,
                    )
                    db.add(vi)
                    db.commit()

            # Specific timestamp from screenshot (2026-10-20 HH:MM)
            msg_dt = datetime(2026, 10, 20, c_data["hour"], c_data["minute"], 0, tzinfo=timezone.utc)

            # SalesActivity
            sa = db.query(SalesActivity).filter(
                SalesActivity.customer_id == cust.id,
                SalesActivity.activity_type == "whatsapp",
                SalesActivity.template_used == "Daily Şasi 6 Ay Ödemesiz Bayi Katkılı Kampanyası"
            ).first()
            if not sa:
                sa = SalesActivity(
                    customer_id=cust.id,
                    user_id=rep_id,
                    activity_type="whatsapp",
                    template_used="Daily Şasi 6 Ay Ödemesiz Bayi Katkılı Kampanyası",
                    campaign_id=daily_campaign.id if daily_campaign else None,
                    message_content=outreach_msg,
                    status="replied",
                    notes=f"Kuveyt Türk 6 Ay Ödemesiz Kampanya Tablosu iletildi. Müşteri tarafından okundu (Mavi Çift Tık - Saat {c_data['hour']:02d}:{c_data['minute']:02d}).",
                    created_at=msg_dt,
                    updated_at=msg_dt,
                )
                db.add(sa)
                db.commit()

            # WhatsAppMessage
            norm_phone = re.sub(r"\D", "", c_data["phone"])
            wm = db.query(WhatsAppMessage).filter(
                WhatsAppMessage.customer_id == cust.id,
                WhatsAppMessage.phone_number == c_data["phone"]
            ).first()
            if not wm:
                wm = WhatsAppMessage(
                    customer_id=cust.id,
                    contact_id=contact.id if contact else None,
                    user_id=rep_id,
                    phone_number=c_data["phone"],
                    normalized_phone=norm_phone,
                    direction="outbound",
                    sender_name="Can Murat Onay",
                    message_type="image",
                    content=outreach_msg,
                    media_url="/campaigns/kuveyt_turk_daily_6ay.png",
                    status="read",
                    source="web_companion",
                    created_at=msg_dt,
                )
                db.add(wm)
                db.commit()

            # CustomerInteraction
            ci = db.query(CustomerInteraction).filter(
                CustomerInteraction.customer_id == cust.id,
                CustomerInteraction.interaction_type == "whatsapp",
                CustomerInteraction.notes.ilike("%Kuveyt Türk 6 Ay Ödemesiz%")
            ).first()
            if not ci:
                ci = CustomerInteraction(
                    customer_id=cust.id,
                    user_id=rep_id,
                    interaction_type="whatsapp",
                    notes=f"Daily Şasi Kuveyt Türk 6 Ay Ödemesiz Kampanyası iletildi ve okundu (Saat {c_data['hour']:02d}:{c_data['minute']:02d}).",
                    next_action="Kuveyt Türk 24/36 ay ödemesiz taksit tercihi ve kasa detayları için takip araması yapılacak.",
                    next_action_date=date.today() + timedelta(days=2),
                    created_at=msg_dt,
                )
                db.add(ci)
                db.commit()

        # Seed Google Arama Niyeti & Web İstihbarat Sinyalleri
        from app.modules.discovery.models import WebIntentSignal
        if db.query(WebIntentSignal).count() == 0:
            intent_seeds = [
                WebIntentSignal(
                    source="google_search",
                    search_query="iveco daily 35c16 şasi fiyatları samsun",
                    target_model="Daily 35C16 Şasi",
                    target_campaign="Kuveyt Türk 6 Ay Ödemesiz",
                    company_name="Sampa Lojistik & Dağıtım Ltd.",
                    city="Samsun",
                    district="Tekkeköy",
                    phone="0532 441 20 18",
                    ip_address="88.241.112.45 (Türk Telekom Metro)",
                    page_url="https://iveco-crm.vercel.app/campaigns/daily-35c16",
                    referrer="https://www.google.com.tr/search?q=iveco+daily+35c16+şasi+fiyatları+samsun",
                    duration_seconds=185,
                    scroll_depth=95,
                    intent_score=96,
                    intent_level="very_high",
                    status="new",
                    notes="Google organik aramadan geldi. Kuveyt Türk 6 ay ödemesiz taksit tablosunu 3 dakika inceledi."
                ),
                WebIntentSignal(
                    source="google_search",
                    search_query="satılık frigorifik kasa kamyonet samsun",
                    target_model="Daily 35C16 Frigorifik",
                    target_campaign="Kuveyt Türk 6 Ay Ödemesiz",
                    company_name="Bafra Organik Tarım & Soğuk Hava",
                    city="Samsun",
                    district="Bafra",
                    phone="0533 612 90 40",
                    ip_address="212.156.40.18 (Vodafone Net B2B)",
                    page_url="https://iveco-crm.vercel.app/vehicles/daily-frigo",
                    referrer="https://www.google.com.tr/search?q=satılık+frigorifik+kasa+kamyonet+samsun",
                    duration_seconds=140,
                    scroll_depth=85,
                    intent_score=92,
                    intent_level="very_high",
                    status="new",
                    notes="Soğuk hava taşımacılığı için Daily frigorifik kasa alternatiflerini arattı. İletişim butonuna tıkladı."
                ),
                WebIntentSignal(
                    source="google_ads",
                    search_query="kuveyt türk 6 ay ödemesiz ticari araç kredisi",
                    target_model="Daily Panelvan & Şasi",
                    target_campaign="Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı",
                    company_name="Karadeniz Un & Yem San. A.Ş.",
                    city="Samsun",
                    district="Tekkeköy",
                    phone="0535 770 12 95",
                    ip_address="195.175.22.88 (Superonline Kurumsal)",
                    page_url="https://iveco-crm.vercel.app/financing/kuveyt-turk-6-ay",
                    referrer="https://www.googleads.g.doubleclick.net/",
                    duration_seconds=210,
                    scroll_depth=100,
                    intent_score=98,
                    intent_level="very_high",
                    status="new",
                    notes="Google Arama Reklamından finansman tablosuna ulaştı. 24 ve 36 ay ödemesiz taksit planlarını indirdi."
                ),
                WebIntentSignal(
                    source="google_search",
                    search_query="iveco eurocargo 150e21 damper kasa samsun",
                    target_model="Eurocargo ML150E",
                    target_campaign="Çatı Finansman Matrisi",
                    company_name="Güven Çelik & Hurdacılık",
                    city="Samsun",
                    district="Canik",
                    phone="0542 319 88 50",
                    ip_address="85.105.74.19 (Turkcell Superonline)",
                    page_url="https://iveco-crm.vercel.app/vehicles/eurocargo",
                    referrer="https://www.google.com.tr/search?q=iveco+eurocargo+150e21+damper+kasa+samsun",
                    duration_seconds=115,
                    scroll_depth=80,
                    intent_score=88,
                    intent_level="high",
                    status="new",
                    notes="Hafriyat ve hurda taşıması için orta tonaj kamyon araması yaptı. Teknik broşürü açtı."
                ),
                WebIntentSignal(
                    source="whatsapp_link",
                    search_query="[Akıllı Teklif Linki Tıklaması]",
                    target_model="Daily 35C16 Şasi",
                    target_campaign="Daily Şasi 6 Ay Ödemesiz Bayi Katkılı Kampanyası",
                    company_name="SHL Sahil Lojistik (Samsun Şubesi)",
                    city="Samsun",
                    district="Tekkeköy",
                    phone="0533 555 10 13",
                    ip_address="31.145.89.12 (Mobil 5G)",
                    page_url="https://iveco-crm.vercel.app/proposals/smart-track?ref=wa_shl_1013",
                    referrer="android-app://com.whatsapp",
                    duration_seconds=320,
                    scroll_depth=100,
                    intent_score=99,
                    intent_level="very_high",
                    status="contacted",
                    notes="WhatsApp'tan Can Murat Onay'ın ilettiği akıllı kampanya linkine 3 kez girdi. Kuveyt Türk ödeme tablosunu 5+ dakika inceledi."
                ),
                WebIntentSignal(
                    source="google_search",
                    search_query="satılık çekici 530 beygir tır kampanyası",
                    target_model="S-Way 530 Çekici",
                    target_campaign="Garanti BBVA & Kuveyt Türk Ağır Vasıta",
                    company_name="Akdeniz & Karadeniz Uluslararası Taşımacılık",
                    city="Trabzon",
                    district="Akçaabat",
                    phone="0530 892 45 10",
                    ip_address="78.180.65.230 (Türk Telekom Fiber)",
                    page_url="https://iveco-crm.vercel.app/vehicles/s-way-530",
                    referrer="https://www.google.com.tr/search?q=satılık+çekici+530+beygir+tır+kampanyası",
                    duration_seconds=160,
                    scroll_depth=90,
                    intent_score=91,
                    intent_level="very_high",
                    status="new",
                    notes="Uluslararası nakliye için S-Way 530 araması yaptı. Yakıt tüketimi ve TCO analiz grafiğini inceledi."
                ),
                WebIntentSignal(
                    source="google_search",
                    search_query="ford transit takas iveco daily farkı",
                    target_model="Daily 35C16 Panelvan",
                    target_campaign="TCO ve Rakip Tasarruf Aracı",
                    company_name="Özlem Gıda Dağıtım & Toptan",
                    city="Ordu",
                    district="Altınordu",
                    phone="0544 230 77 15",
                    ip_address="88.255.19.102 (D-Smart Net)",
                    page_url="https://iveco-crm.vercel.app/compare/daily-vs-transit",
                    referrer="https://www.google.com.tr/search?q=ford+transit+takas+iveco+daily+farkı",
                    duration_seconds=95,
                    scroll_depth=75,
                    intent_score=84,
                    intent_level="high",
                    status="new",
                    notes="Mevcut 2019 Ford Transit'lerini yenilemek istiyor. TCO Yakıt & Servis Tasarrufu aracını çalıştırdı."
                ),
                WebIntentSignal(
                    source="google_ads",
                    search_query="sıfır km 7.2 ton kamyonet b ehliyet",
                    target_model="Daily 70C / 72C",
                    target_campaign="Daily Ağır Yük Kampanyası",
                    company_name="Çarşamba Çeltik & Pirinç Ltd.",
                    city="Samsun",
                    district="Çarşamba",
                    phone="0536 911 34 60",
                    ip_address="176.234.120.55 (Turkcell B2B)",
                    page_url="https://iveco-crm.vercel.app/vehicles/daily-72c",
                    referrer="https://www.googleads.g.doubleclick.net/",
                    duration_seconds=75,
                    scroll_depth=60,
                    intent_score=78,
                    intent_level="high",
                    status="new",
                    notes="Yüksek tonaj taşıma arayışında. 70C şasi taşıma kapasitesi ve kasa boyutu tablosuna baktı."
                ),
            ]
            db.add_all(intent_seeds)
            db.commit()

    finally:
        db.close()


