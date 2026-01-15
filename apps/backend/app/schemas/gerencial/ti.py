"""TI schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ChamadoTIBase(BaseModel):
    """Base chamado TI schema."""

    titulo: str
    descricao: str
    tipo: str
    prioridade: str
    setor: str
    solicitante: str
    data_abertura: str
    data_fechamento: Optional[str] = None
    status: str = "aberto"
    tecnico_responsavel: Optional[str] = None
    solucao: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class ChamadoTICreate(ChamadoTIBase):
    """Chamado TI creation schema."""

    pass


class ChamadoTIUpdate(BaseModel):
    """Chamado TI update schema."""

    titulo: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    prioridade: Optional[str] = None
    setor: Optional[str] = None
    solicitante: Optional[str] = None
    data_abertura: Optional[str] = None
    data_fechamento: Optional[str] = None
    status: Optional[str] = None
    tecnico_responsavel: Optional[str] = None
    solucao: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class ChamadoTIResponse(ChamadoTIBase):
    """Chamado TI response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
