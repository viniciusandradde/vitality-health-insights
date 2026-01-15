"""Higienização schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ServicoHigienizacaoBase(BaseModel):
    """Base serviço de higienização schema."""

    setor: str
    tipo_servico: str
    data: str
    hora: Optional[str] = None
    profissional: str
    status: str = "agendado"
    observacoes: Optional[str] = None
    centro_custo: str


class ServicoHigienizacaoCreate(ServicoHigienizacaoBase):
    """Serviço de higienização creation schema."""

    pass


class ServicoHigienizacaoUpdate(BaseModel):
    """Serviço de higienização update schema."""

    setor: Optional[str] = None
    tipo_servico: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    profissional: Optional[str] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: Optional[str] = None


class ServicoHigienizacaoResponse(ServicoHigienizacaoBase):
    """Serviço de higienização response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
