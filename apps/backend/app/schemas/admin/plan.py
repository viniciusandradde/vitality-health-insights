"""Plan schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from decimal import Decimal


class PlanBase(BaseModel):
    """Base plan schema."""

    name: str
    description: Optional[str] = None
    price_monthly: Decimal
    features: list[str] = []
    max_users: int
    max_api_calls: Optional[int] = None
    max_storage_gb: Optional[int] = None
    is_active: bool = True


class PlanCreate(PlanBase):
    """Plan creation schema."""

    pass


class PlanUpdate(BaseModel):
    """Plan update schema."""

    name: Optional[str] = None
    description: Optional[str] = None
    price_monthly: Optional[Decimal] = None
    features: Optional[list[str]] = None
    max_users: Optional[int] = None
    max_api_calls: Optional[int] = None
    max_storage_gb: Optional[int] = None
    is_active: Optional[bool] = None


class PlanResponse(PlanBase):
    """Plan response schema."""

    id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
