"""Tenant model."""
from sqlalchemy import Boolean, Column, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Tenant(BaseModel):
    """Tenant (Organization/Hospital) model."""

    __tablename__ = "tenants"

    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), nullable=True)
    timezone = Column(String(50), default="America/Sao_Paulo", nullable=False)
    language = Column(String(10), default="pt-BR", nullable=False)
    modules_enabled = Column(JSON, default=list, nullable=False)
    max_users = Column(Integer, default=10, nullable=False)
    data_retention_days = Column(Integer, default=365, nullable=False)

    # Address
    address_street = Column(String(255), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(50), nullable=True)
    address_zip = Column(String(20), nullable=True)
    address_country = Column(String(100), default="Brasil", nullable=False)

    # Contact
    cnpj = Column(String(18), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    trial_ends_at = Column(String, nullable=True)

    # Relationships
    users = relationship("User", back_populates="tenant", lazy="selectin")
    subscriptions = relationship("Subscription", back_populates="tenant", lazy="selectin")
