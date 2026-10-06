"""
SQLAlchemy veritabanı motoru, oturum fabrikası ve Base model.

Üretimde (Render) kalıcı veri için PostgreSQL (Supabase) kullanılır:
    DATABASE_URL=postgresql://...  (Render ortam değişkeni)
Yerel geliştirmede SQLite (backend/iveco_crm.db) kullanılır.

ÖNEMLİ: Uzak veritabanına bağlanılamazsa uygulama ayakta kalsın diye geçici SQLite'a
düşülür, ANCAK bu durum gizlenmez: STORAGE_MODE = "ephemeral" olur, /api/health bunu
raporlar ve arayüz kırmızı uyarı bandı gösterir (Render'da bu dosya her yeniden başlatmada silinir).
"""

import os
from pathlib import Path

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
SQLITE_DB_PATH = BACKEND_DIR / "iveco_crm.db"
DEFAULT_SQLITE_URL = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"

# Render, Heroku vb. platformlarda çalışıyor muyuz? (diski geçici olan ortamlar)
IS_CLOUD = bool(os.environ.get("RENDER") or os.environ.get("RENDER_SERVICE_ID"))


def _normalize_url(url: str) -> str:
    url = (url or "").strip()
    if url.startswith("postgres://"):  # Supabase/Heroku eski şeması
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("sqlite:///."):
        rel = url.replace("sqlite:///.", "").lstrip("/\\")
        url = f"sqlite:///{(BACKEND_DIR / rel).resolve().as_posix()}"
    return url or DEFAULT_SQLITE_URL


def _mask(url: str) -> str:
    """Şifreyi loglarda göstermemek için maskeler."""
    if "@" in url and "://" in url:
        scheme, rest = url.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0]
        return f"{scheme}://{user}:***@{host}"
    return url


def tr_norm(s):
    """Türkçe karakterleri ve büyük/küçük harfleri standart ASCII forma dönüştürür."""
    if not s:
        return ""
    tr_map = str.maketrans("ÇĞİÖŞÜIçğıöşü", "cgiosuicgiosu")
    return str(s).translate(tr_map).lower()


# Postgres'te aynı tr_norm davranışı (aramalar func.tr_norm kullanıyor)
PG_TR_NORM_SQL = """
CREATE OR REPLACE FUNCTION tr_norm(t text) RETURNS text AS $$
    SELECT lower(translate(coalesce(t, ''), 'ÇĞİÖŞÜIçğıöşü', 'cgiosuicgiosu'))
$$ LANGUAGE sql IMMUTABLE;
"""


@event.listens_for(Engine, "connect")
def _configure_connection(dbapi_connection, connection_record):
    """Yalnızca SQLite bağlantılarında: tr_norm fonksiyonu, foreign key ve WAL."""
    if not hasattr(dbapi_connection, "create_function"):
        return  # PostgreSQL vb. — PRAGMA çalıştırma (işlemi bozar)
    try:
        dbapi_connection.create_function("tr_norm", 1, tr_norm)
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()
    except Exception:
        pass


def _make_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False}, echo=settings.DEBUG)
    return create_engine(
        url,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=5,
        connect_args={"connect_timeout": 10},
    )


db_url = _normalize_url(settings.DATABASE_URL)
STORAGE_ERROR = None

try:
    engine = _make_engine(db_url)
    with engine.connect():
        pass
except Exception as e:
    STORAGE_ERROR = f"{type(e).__name__}: {str(e).splitlines()[0][:200]}"
    print(f"[!!!] VERİTABANI BAĞLANTI HATASI ({_mask(db_url)}): {STORAGE_ERROR}")
    print(f"[!!!] Geçici SQLite'a düşülüyor: {SQLITE_DB_PATH} — BULUTTA VERİLER KALICI DEĞİL!")
    db_url = DEFAULT_SQLITE_URL
    engine = _make_engine(db_url)

is_sqlite = db_url.startswith("sqlite")

if not is_sqlite:
    STORAGE_MODE = "postgres"          # kalıcı
elif IS_CLOUD:
    STORAGE_MODE = "ephemeral"         # Render diskinde SQLite → yeniden başlatmada silinir
else:
    STORAGE_MODE = "sqlite-local"      # geliştirici bilgisayarı (kalıcı)

print(f"[*] Veritabanı: {_mask(db_url)} | mod: {STORAGE_MODE}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def storage_status() -> dict:
    return {
        "mode": STORAGE_MODE,
        "persistent": STORAGE_MODE != "ephemeral",
        "engine": "postgresql" if not is_sqlite else "sqlite",
        "error": STORAGE_ERROR,
    }


def import_all_models():
    """Tüm modelleri hafızaya alarak SQLAlchemy mapper ilişkilerinin düzgün çözümlenmesini sağlar."""
    import app.modules.auth.models  # noqa: F401
    import app.modules.crm.models  # noqa: F401
    import app.modules.sales_activity.models  # noqa: F401
    import app.modules.discovery.models  # noqa: F401
    import app.modules.campaigns.models  # noqa: F401
    import app.modules.notifications.models  # noqa: F401
    import app.modules.vehicles.models  # noqa: F401
    import app.modules.contacts.models  # noqa: F401


def create_all_tables():
    """Tabloları oluşturur; Postgres'te tr_norm SQL fonksiyonunu kurar."""
    import_all_models()
    Base.metadata.create_all(bind=engine)
    if not is_sqlite:
        with engine.begin() as conn:
            conn.execute(text(PG_TR_NORM_SQL))


# Modelleri uygulama ilk ayağa kalkarken otomatik yükle
try:
    import_all_models()
except Exception:
    pass
