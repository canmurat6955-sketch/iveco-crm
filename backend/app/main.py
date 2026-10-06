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
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


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
                hashed_password=get_password_hash("erccrm"),
                full_name="Sistem Yöneticisi",
                role="admin",
                is_active=True,
            )
            db.add(admin)

        sales_rep = db.query(User).filter(User.email == "satis@iveco-crm.local").first()
        if not sales_rep:
            sales_rep = User(
                email="satis@iveco-crm.local",
                hashed_password=get_password_hash("erccrm"),
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

        # Seed Personal Contacts if empty
        from app.modules.contacts.models import PersonalContact
        if db.query(PersonalContact).count() == 0:
            import sqlite3
            seed_path = Path(__file__).resolve().parent.parent.parent / "data" / "seed_iveco_crm.db"
            if seed_path.exists():
                try:
                    s_conn = sqlite3.connect(seed_path)
                    s_cur = s_conn.cursor()
                    s_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='personal_contacts'")
                    if s_cur.fetchone():
                        s_cur.execute("SELECT id, full_name, phone, city, district, notes, source, original_customer_id, converted_customer_id FROM personal_contacts")
                        rows = s_cur.fetchall()
                        contacts_to_add = [
                            PersonalContact(
                                id=r[0], full_name=r[1], phone=r[2], city=r[3], district=r[4],
                                notes=r[5], source=r[6], original_customer_id=r[7], converted_customer_id=r[8]
                            ) for r in rows
                        ]
                        db.bulk_save_objects(contacts_to_add)
                        db.commit()
                        print(f"[*] {len(contacts_to_add)} kisilik rehber tohum veritabanindan basariyla aktarildi.")
                    s_conn.close()
                except Exception as seed_err:
                    print(f"[!] Rehber tohum aktarim hatasi: {seed_err}")

        # Seed Customers if empty or low
        from app.modules.crm.models import Customer
        if db.query(Customer).count() < 500:
            import sqlite3
            seed_path = Path(__file__).resolve().parent.parent.parent / "data" / "seed_iveco_crm.db"
            if seed_path.exists():
                try:
                    s_conn = sqlite3.connect(seed_path)
                    s_cur = s_conn.cursor()
                    s_cur.execute("SELECT id, company_name, authorized_person, phone, email, city, district, address, tax_office, tax_number, sector, status, potential_score FROM customers")
                    existing_ids = set(c[0] for c in db.query(Customer.id).all())
                    new_custs = []
                    for r in s_cur.fetchall():
                        if r[0] not in existing_ids:
                            new_custs.append(Customer(
                                id=r[0], company_name=r[1], authorized_person=r[2], phone=r[3], email=r[4],
                                city=r[5], district=r[6], address=r[7], tax_office=r[8], tax_number=r[9],
                                sector=r[10], status=r[11], potential_score=r[12]
                            ))
                    if new_custs:
                        db.bulk_save_objects(new_custs)
                        db.commit()
                        print(f"[*] {len(new_custs)} musteri tohum veritabanindan aktarildi.")
                    s_conn.close()
                except Exception as cust_err:
                    print(f"[!] Musteri tohum aktarim hatasi: {cust_err}")

    finally:
        db.close()
