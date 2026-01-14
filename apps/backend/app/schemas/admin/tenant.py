"""Tenant schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TenantBase(BaseModel):
    """Base tenant schema."""

    name: str
    slug: str
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    timezone: str = "America/Sao_Paulo"
    language: str = "pt-BR"
    modules_enabled: list[str] = []
    max_users: int = 10
    data_retention_days: int = 365
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: str = "Brasil"
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True
    trial_ends_at: Optional[str] = None


class TenantCreate(TenantBase):
    """Tenant creation schema."""

    pass


class TenantUpdate(BaseModel):
    """Tenant update schema."""

    name: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    modules_enabled: Optional[list[str]] = None
    max_users: Optional[int] = None
    data_retention_days: Optional[int] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: Optional[str] = None
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    trial_ends_at: Optional[str] = None


class TenantResponse(TenantBase):
    """Tenant response schema."""

    id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
