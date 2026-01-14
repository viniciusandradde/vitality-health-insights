"""Fisioterapia schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class SessaoFisioterapiaBase(BaseModel):
    """Base sessão de fisioterapia schema."""

    paciente_id: UUID
    paciente_nome: str
    data: str
    hora: Optional[str] = None
    tipo_sessao: str
    profissional: str
    duracao: Optional[int] = None
    status: str = "agendada"
    evolucao: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class SessaoFisioterapiaCreate(SessaoFisioterapiaBase):
    """Sessão de fisioterapia creation schema."""

    pass


class SessaoFisioterapiaUpdate(BaseModel):
    """Sessão de fisioterapia update schema."""

    paciente_nome: Optional[str] = None
    data: Optional[str] = None
    hora: Optional[str] = None
    tipo_sessao: Optional[str] = None
    profissional: Optional[str] = None
    duracao: Optional[int] = None
    status: Optional[str] = None
    evolucao: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class SessaoFisioterapiaResponse(SessaoFisioterapiaBase):
    """Sessão de fisioterapia response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
