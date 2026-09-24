"""
SQLAlchemy database engine, session factory and Base model.
Uses SQLite for MVP, designed for easy migration to PostgreSQL.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

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
    print(f"[!] Veritabanı bağlantı hatası ({db_url}): {e}. Yerel SQLite veritabanına (iveco_crm.db) geçiliyor.")
    db_url = "sqlite:///./iveco_crm.db"
    is_sqlite = True
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=settings.DEBUG,
    )


if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Enable foreign keys and WAL mode for SQLite."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Create all tables in the database. Used for initial setup."""
    Base.metadata.create_all(bind=engine)
