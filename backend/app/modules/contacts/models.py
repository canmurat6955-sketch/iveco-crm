"""
Kişilerim (kişisel rehber) modeli.

Telefon rehberinden gelen ve firma olmayan kayıtlar burada tutulur;
müşteri/firma listesini, pipeline'ı ve skorlamayı kirletmez.
İstenirse tek tıkla firmaya (Customer) dönüştürülebilir.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


class PersonalContact(Base):
    __tablename__ = "personal_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(500), nullable=False, index=True)
    phone = Column(String(50), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String(50), nullable=True)
    original_customer_id = Column(Integer, nullable=True)   # taşınmadan önceki müşteri ID'si
    converted_customer_id = Column(Integer, nullable=True)  # firmaya dönüştürüldüyse yeni müşteri ID'si
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
