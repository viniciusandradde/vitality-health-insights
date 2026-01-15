"""Farmácia schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class PrescricaoBase(BaseModel):
    """Base prescrição schema."""

    paciente_id: UUID
    paciente_nome: str
    data_prescricao: str
    medicamento: str
    principio_ativo: Optional[str] = None
    dosagem: str
    via: str
    frequencia: Optional[str] = None
    duracao: Optional[str] = None
    quantidade: Optional[str] = None
    status: str = "prescrito"
    dispensado: bool = False
    data_dispensacao: Optional[str] = None
    medico_prescritor: Optional[str] = None
    centro_custo: str
    observacoes: Optional[str] = None


class PrescricaoCreate(PrescricaoBase):
    """Prescrição creation schema."""

    pass


class PrescricaoUpdate(BaseModel):
    """Prescrição update schema."""

    paciente_nome: Optional[str] = None
    data_prescricao: Optional[str] = None
    medicamento: Optional[str] = None
    principio_ativo: Optional[str] = None
    dosagem: Optional[str] = None
    via: Optional[str] = None
    frequencia: Optional[str] = None
    duracao: Optional[str] = None
    quantidade: Optional[str] = None
    status: Optional[str] = None
    dispensado: Optional[bool] = None
    data_dispensacao: Optional[str] = None
    medico_prescritor: Optional[str] = None
    centro_custo: Optional[str] = None
    observacoes: Optional[str] = None


class PrescricaoResponse(PrescricaoBase):
    """Prescrição response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
