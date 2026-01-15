"""Subscription and related models."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Plan(BaseModel):
    """Subscription plan model."""

    __tablename__ = "plans"

    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    price_monthly = Column(Numeric(10, 2), nullable=False)
    features = Column(String, nullable=True)  # JSON string
    max_users = Column(Integer, nullable=False)
    max_api_calls = Column(Integer, nullable=True)
    max_storage_gb = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    subscriptions = relationship("Subscription", back_populates="plan", lazy="selectin")


class Subscription(BaseModel):
    """Subscription model."""

    __tablename__ = "subscriptions"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    status = Column(String(50), default="active", nullable=False)  # active, past_due, canceled, trialing
    current_period_start = Column(String, nullable=False)
    current_period_end = Column(String, nullable=False)
    price_monthly = Column(Numeric(10, 2), nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="subscriptions", lazy="selectin")
    plan = relationship("Plan", back_populates="subscriptions", lazy="selectin")


class Invoice(BaseModel):
    """Invoice model."""

    __tablename__ = "invoices"

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=True)
    number = Column(String(50), unique=True, nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="open", nullable=False)  # paid, open, void, uncollectible
    pdf_url = Column(String(500), nullable=True)
