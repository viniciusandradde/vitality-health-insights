"""Exames de imagem schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ExameImagemBase(BaseModel):
    """Base exame de imagem schema."""

    paciente_id: UUID
    paciente_nome: str
    data_solicitacao: str
    data_realizacao: Optional[str] = None
    tipo_exame: str
    modalidade: str
    status: str = "solicitado"
    laudo: Optional[str] = None
    medico_solicitante: Optional[str] = None
    medico_laudador: Optional[str] = None
    centro_custo: str
    convenio: Optional[str] = None
    observacoes: Optional[str] = None


class ExameImagemCreate(ExameImagemBase):
    """Exame de imagem creation schema."""

    pass


class ExameImagemUpdate(BaseModel):
    """Exame de imagem update schema."""

    paciente_nome: Optional[str] = None
    data_solicitacao: Optional[str] = None
    data_realizacao: Optional[str] = None
    tipo_exame: Optional[str] = None
    modalidade: Optional[str] = None
    status: Optional[str] = None
    laudo: Optional[str] = None
    medico_solicitante: Optional[str] = None
    medico_laudador: Optional[str] = None
    centro_custo: Optional[str] = None
    convenio: Optional[str] = None
    observacoes: Optional[str] = None


class ExameImagemResponse(ExameImagemBase):
    """Exame de imagem response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
