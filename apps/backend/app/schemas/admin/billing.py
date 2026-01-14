"""Billing schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from decimal import Decimal


class InvoiceResponse(BaseModel):
    """Invoice response schema."""

    id: UUID
    tenant_id: UUID
    subscription_id: Optional[UUID] = None
    number: str
    amount: Decimal
    status: str
    pdf_url: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    """Checkout request schema."""

    plan_id: UUID
    tenant_id: UUID
    payment_method: str = "card"


class CheckoutResponse(BaseModel):
    """Checkout response schema."""

    checkout_url: str
    session_id: str
