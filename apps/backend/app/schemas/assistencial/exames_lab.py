"""Exames laboratoriais schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ExameLaboratorialBase(BaseModel):
    """Base exame laboratorial schema."""

    paciente_id: UUID
    paciente_nome: str
    data_solicitacao: str
    data_coleta: Optional[str] = None
    data_resultado: Optional[str] = None
    tipo_exame: str
    codigo_exame: Optional[str] = None
    status: str = "solicitado"
    resultado: Optional[str] = None
    valor_referencia: Optional[str] = None
    medico_solicitante: Optional[str] = None
    centro_custo: str
    convenio: Optional[str] = None
    observacoes: Optional[str] = None


class ExameLaboratorialCreate(ExameLaboratorialBase):
    """Exame laboratorial creation schema."""

    pass


class ExameLaboratorialUpdate(BaseModel):
    """Exame laboratorial update schema."""

    paciente_nome: Optional[str] = None
    data_solicitacao: Optional[str] = None
    data_coleta: Optional[str] = None
    data_resultado: Optional[str] = None
    tipo_exame: Optional[str] = None
    codigo_exame: Optional[str] = None
    status: Optional[str] = None
    resultado: Optional[str] = None
    valor_referencia: Optional[str] = None
    medico_solicitante: Optional[str] = None
    centro_custo: Optional[str] = None
    convenio: Optional[str] = None
    observacoes: Optional[str] = None


class ExameLaboratorialResponse(ExameLaboratorialBase):
    """Exame laboratorial response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
