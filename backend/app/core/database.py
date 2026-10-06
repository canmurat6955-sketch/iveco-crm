"""
SQLAlchemy database engine, session factory and Base model.
Uses SQLite for MVP, designed for easy migration to PostgreSQL.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

import shutil
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
SQLITE_DB_PATH = BACKEND_DIR / "iveco_crm.db"
SEED_DB_PATH = BACKEND_DIR / "data" / "seed_iveco_crm.db"
DEFAULT_SQLITE_URL = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///."):
    # Always resolve relative sqlite paths to BACKEND_DIR
    rel = db_url.replace("sqlite:///.", "").lstrip("/\\")
    db_url = f"sqlite:///{(BACKEND_DIR / rel).resolve().as_posix()}"

is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Tohum SQLite veritabanı otomatik geri yükleme (Render veya taze bulut kurulumları için)
if is_sqlite and SEED_DB_PATH.exists():
    try:
        if not SQLITE_DB_PATH.exists() or SQLITE_DB_PATH.stat().st_size < 500000:
            print(f"[*] Eksik/küçük SQLite tespit edildi, tohum veritabanı yükleniyor: {SEED_DB_PATH} -> {SQLITE_DB_PATH}")
            shutil.copy2(SEED_DB_PATH, SQLITE_DB_PATH)
    except Exception as copy_err:
        print(f"[!] Tohum veritabanı yükleme hatası: {copy_err}")

from sqlalchemy.engine import Engine


def tr_norm(s):
    """Türkçe karakterleri ve büyük/küçük harfleri standart ASCII forma dönüştürür."""
    if not s:
        return ""
    tr_map = str.maketrans("ÇĞİÖŞÜIçğıöşü", "cgiosuicgiosu")
    return str(s).translate(tr_map).lower()


@event.listens_for(Engine, "connect")
def configure_sqlite_connection(dbapi_connection, connection_record):
    """Enable foreign keys, WAL mode and register Turkish tr_norm function for SQLite."""
    if hasattr(dbapi_connection, "create_function"):
        try:
            dbapi_connection.create_function("tr_norm", 1, tr_norm)
        except Exception:
            pass
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()
    except Exception:
        pass


try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    # Hızlı bağlantı testi (özellikle uzak PostgreSQL/Supabase için)
    with engine.connect() as conn:
        pass
except Exception as e:
    # Uzak veritabanı kapalıysa veya ulaşılamıyorsa yerel SQLite'a güvenle geç
    print(f"[!] Veritabanı bağlantı hatası ({db_url}): {e}. Yerel SQLite veritabanına ({SQLITE_DB_PATH}) geçiliyor.")
    db_url = DEFAULT_SQLITE_URL
    is_sqlite = True
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=settings.DEBUG,
    )



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def import_all_models():
    """Tüm modelleri hafızaya alarak SQLAlchemy mapper ilişkilerinin düzgün çözümlenmesini sağlar."""
    import app.modules.auth.models
    import app.modules.crm.models
    import app.modules.sales_activity.models
    import app.modules.discovery.models
    import app.modules.campaigns.models
    import app.modules.notifications.models
    import app.modules.vehicles.models
    import app.modules.contacts.models


def create_all_tables():
    """Create all tables in the database. Used for initial setup."""
    import_all_models()
    Base.metadata.create_all(bind=engine)


# Modelleri uygulama ilk ayağa kalkarken otomatik yükle
try:
    import_all_models()
except Exception:
    pass

