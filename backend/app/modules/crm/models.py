"""
CRM database models: Customer and CustomerInteraction.
"""

from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Date,
    ForeignKey, Index, Float
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(500), nullable=False, index=True)
    tax_number = Column(String(50), nullable=True, index=True)
    city = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True, index=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    sector = Column(String(200), nullable=True)
    current_fleet = Column(Text, nullable=True)
    estimated_fleet_size = Column(Integer, nullable=True)
    previous_vehicles = Column(Text, nullable=True)
    last_contact_date = Column(Date, nullable=True)
    segment = Column(String(10), default="C")  # A, B, C, D
    sales_notes = Column(Text, nullable=True)
    potential_level = Column(String(20), default="medium")  # very_high, high, medium, low
    potential_score = Column(Integer, default=0)
    source = Column(String(20), default="manual")  # manual, import, discovery
    pipeline_stage = Column(String(30), default="lead")  # lead, contact, proposal, negotiation, won, lost
    pipeline_note = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # GPS ve Google Places alanları
    google_place_id = Column(String(500), nullable=True, index=True)
    google_formatted_address = Column(Text, nullable=True)
    google_maps_url = Column(String(1000), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


    # Relationships
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    interactions = relationship("CustomerInteraction", back_populates="customer", cascade="all, delete-orphan")
    contacts = relationship("CustomerContact", back_populates="customer", cascade="all, delete-orphan")

    # Composite indexes for duplicate detection
    __table_args__ = (
        Index("ix_customers_city_district", "city", "district"),
        Index("ix_customers_company_city", "company_name", "city"),
    )

    def __repr__(self):
        return f"<Customer {self.company_name}>"


class CustomerInteraction(Base):
    __tablename__ = "customer_interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    interaction_type = Column(String(50), nullable=False)  # call, visit, email, whatsapp, meeting
    notes = Column(Text, nullable=True)
    next_action = Column(String(500), nullable=True)
    next_action_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    customer = relationship("Customer", back_populates="interactions")
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Interaction {self.interaction_type} for Customer#{self.customer_id}>"


class CustomerContact(Base):
    """Firma irtibat kişisi — patron, şoför, muhasebeci vs."""
    __tablename__ = "customer_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_name = Column(String(200), nullable=False)
    role = Column(String(100), nullable=True)  # Patron, Şoför, Muhasebeci, Satış, vs.
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    customer = relationship("Customer", back_populates="contacts")

    __table_args__ = (
        Index("ix_customer_contacts_phone", "phone"),
    )

    def __repr__(self):
        return f"<Contact {self.contact_name} ({self.role}) for Customer#{self.customer_id}>"
