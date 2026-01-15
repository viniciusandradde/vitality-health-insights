"""Hotelaria schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ServicoHotelariaBase(BaseModel):
    """Base serviço de hotelaria schema."""

    setor: str
    tipo_servico: str
    data: str
    hora: Optional[str] = None
    quantidade: Optional[int] = None
    profissional: str
    status: str = "agendado"
    observacoes: Optional[str] = None
    centro_custo: str


class ServicoHotelariaCreate(ServicoHotelariaBase):
    """Serviço de hotelaria creation schema."""

    pass


class ServicoHotelariaUpdate(BaseModel):
    """Serviço de hotelaria update schema."""

    setor: Optional[str] = None
    tipo_servico: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    quantidade: Optional[int] = None
    profissional: Optional[str] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: Optional[str] = None


class ServicoHotelariaResponse(ServicoHotelariaBase):
    """Serviço de hotelaria response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
