"""Integration admin schemas."""
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class IntegrationAdminResponse(BaseModel):
    """Integration response schema for admin."""

    id: UUID
    nome: str
    tipo: str
    url: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict] = None
    ativo: bool
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class IntegrationAdminUpdate(BaseModel):
    """Integration update schema for admin."""

    nome: Optional[str] = None
    tipo: Optional[str] = None
    url: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict] = None
    ativo: Optional[bool] = None
