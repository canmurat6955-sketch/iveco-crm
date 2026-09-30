"""
Vehicle database models: VehicleMaster, CustomerVehicleInterest, VehicleStock.
"""
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Date,
    ForeignKey, Float, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class VehicleMaster(Base):
    """
    Central IVECO Vehicle Master Database.
    All dynamic model combinations (Daily, Eurocargo, S-Way, X-Way, T-Way)
    with technical specs, dimensions, and bodywork fields.
    """
    __tablename__ = "vehicle_master"

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand = Column(String(50), default="IVECO", nullable=False)
    vehicle_group = Column(String(50), nullable=False, index=True)  # Daily, Eurocargo, S-Way, X-Way, T-Way
    vehicle_sub_group = Column(String(50), nullable=True, index=True)  # Panelvan, Şasi Kamyonet, Rigit Kamyon, Çekici, Hafriyat, Mikser
    model_code = Column(String(50), nullable=False, index=True)  # 35S16, 35C16, 70C18, 72C16, 100E19, 120E19, 150E21, 160E32, 500, 580
    tonnage_kg = Column(Integer, nullable=True)  # 3500, 7000, 7200, 10000, 12000, 15000, 16000
    wheel_type = Column(String(20), nullable=True)  # single, twin
    wheel_count = Column(Integer, nullable=True)  # 4, 6, 10, 12
    engine_code = Column(String(50), nullable=True)  # F1A, F1C, Tector 7, Cursor 13
    engine_power = Column(Integer, nullable=True, index=True)  # 160, 180, 190, 210, 320, 460, 500, 540, 580 (BG)
    engine_volume = Column(Float, nullable=True)  # 2.3, 3.0, 6.7, 11.1, 12.9
    transmission = Column(String(30), nullable=True)  # Manuel, Otomatik (A8), HI-TRONIX
    transmission_code = Column(String(20), nullable=True)  # MAN, A8, AUTO
    body_volume = Column(Float, nullable=True, index=True)  # 12, 16, 18 (m³)
    wheelbase = Column(Integer, nullable=True, index=True)  # 3450, 3750, 4100, 4350, 4750 (mm)
    wbs = Column(Integer, nullable=True, index=True)  # 3690, 4185, 4455, 4815, 5175, 5670, 6570 (mm)
    equipment_level = Column(String(50), nullable=True)  # Standart, Full, Full Plus, Diamond
    usage_type = Column(String(50), nullable=True, index=True)  # Hafriyat, Mikser, Dağıtım, Uluslararası, Kargo

    # Gelecekte Kasa / Üst Yapı Entegrasyon Alanları
    body_type = Column(String(100), nullable=True)  # Açık Kasa, Kapalı Sac, Frigo, Damper, Mikser
    body_length = Column(Float, nullable=True)  # Kasa uzunluğu (mm) — wheelbase ile ayrı!
    body_width = Column(Float, nullable=True)
    body_height = Column(Float, nullable=True)
    body_brand = Column(String(100), nullable=True)
    body_model = Column(String(100), nullable=True)
    body_price = Column(Float, nullable=True)
    body_active = Column(Boolean, default=True)

    active = Column(Boolean, default=True, index=True)  # Soft delete
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint(
            'vehicle_group', 'vehicle_sub_group', 'model_code',
            'wheelbase', 'wbs', 'equipment_level', 'body_volume', 'transmission',
            name='uq_vehicle_master_spec'
        ),
        Index('ix_vehicle_master_search', 'vehicle_group', 'model_code', 'active'),
    )

    # Relationships
    interests = relationship("CustomerVehicleInterest", back_populates="vehicle", cascade="all, delete-orphan")
    stocks = relationship("VehicleStock", back_populates="vehicle", cascade="all, delete-orphan")


class CustomerVehicleInterest(Base):
    """
    Standardized customer vehicle demand table.
    Tracks multi-vehicle interest per customer, purchase timeframe,
    interest level, and links with stock & campaigns.
    """
    __tablename__ = "customer_vehicle_interests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle_master.id", ondelete="RESTRICT"), nullable=False, index=True)
    interest_level = Column(String(30), nullable=False, default="medium", index=True)  # very_low, low, medium, high, purchase_ready
    purchase_timeframe = Column(String(30), nullable=False, default="1_3_months", index=True)  # immediate, 0_30_days, 1_3_months, 3_6_months, 6_12_months, unknown
    estimated_quantity = Column(Integer, default=1, nullable=False)
    usage_type = Column(String(100), nullable=True)
    customer_note = Column(Text, nullable=True)  # Not sadece açıklama içindir, araç verisi model_code/vehicle'da tutulur
    opportunity_status = Column(String(30), default="open", index=True)  # open, quoted, won, lost, cancelled
    last_activity_date = Column(Date, nullable=True, index=True)
    next_activity_date = Column(Date, nullable=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('ix_cvi_customer_vehicle', 'customer_id', 'vehicle_id'),
        Index('ix_cvi_interest_timeframe', 'interest_level', 'purchase_timeframe'),
    )

    # Relationships
    customer = relationship("Customer", back_populates="vehicle_interests")
    vehicle = relationship("VehicleMaster", back_populates="interests")
    creator = relationship("User", foreign_keys=[created_by])


class VehicleStock(Base):
    """
    Physical vehicle inventory in dealership or in-transit.
    """
    __tablename__ = "vehicle_stock"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle_master.id", ondelete="RESTRICT"), nullable=False, index=True)
    chassis_no = Column(String(50), nullable=True, index=True)
    status = Column(String(30), default="in_stock", index=True)  # in_stock, in_transit, reserved, sold
    location = Column(String(100), default="Samsun Merkez")
    year = Column(Integer, default=2024)
    color = Column(String(50), default="Beyaz")
    list_price = Column(Float, nullable=True)
    currency = Column(String(10), default="EUR")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = relationship("VehicleMaster", back_populates="stocks")
