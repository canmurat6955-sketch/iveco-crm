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

        # NOT: Demo keşif kaynakları (demo_source scraper) kaldırıldı - gerçek veri kaynağı değildi.

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

        # Satış temsilcisi adı her zaman Can Murat Onay olsun
        sales_rep = db.query(User).filter(User.email == "satis@iveco-crm.local").first()
        if sales_rep and sales_rep.full_name != "Can Murat Onay":
            sales_rep.full_name = "Can Murat Onay"
            db.add(sales_rep)
            db.commit()

        # NOT: Demo filo araçları, 'kampanya gönderilen 14 firma', sahte WhatsApp/aktivite
        # geçmişi ve uydurma web niyet sinyalleri BİLEREK kaldırıldı (30.10.2026).
        # Sistem bakir başlar; veriler yalnızca kullanıcı çalıştıkça oluşur.

    finally:
        db.close()


