"""Settings Integrações schemas."""
from typing import Dict, Optional
from uuid import UUID
from pydantic import BaseModel


class IntegracaoBase(BaseModel):
    """Base integração schema."""

    nome: str
    tipo: str  # erp, wareline, tasy, outro
    url: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict] = None  # JSON with ERP config: erp_type, erp_host, erp_port, etc.
    ativo: bool = False


class IntegracaoCreate(IntegracaoBase):
    """Integração creation schema."""

    pass


class IntegracaoUpdate(BaseModel):
    """Integração update schema."""

    nome: Optional[str] = None
    tipo: Optional[str] = None
    url: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[Dict] = None
    ativo: Optional[bool] = None


class IntegracaoResponse(IntegracaoBase):
    """Integração response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
