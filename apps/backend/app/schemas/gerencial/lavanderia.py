"""Lavanderia schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ServicoLavanderiaBase(BaseModel):
    """Base serviço de lavanderia schema."""

    setor: str
    tipo_roupa: str
    quantidade: int
    data_entrada: str
    data_saida: Optional[str] = None
    status: str = "recebido"
    profissional: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: str


class ServicoLavanderiaCreate(ServicoLavanderiaBase):
    """Serviço de lavanderia creation schema."""

    pass


class ServicoLavanderiaUpdate(BaseModel):
    """Serviço de lavanderia update schema."""

    setor: Optional[str] = None
    tipo_roupa: Optional[str] = None
    quantidade: Optional[int] = None
    data_entrada: Optional[str] = None
    data_saida: Optional[str] = None
    status: Optional[str] = None
    profissional: Optional[str] = None
    observacoes: Optional[str] = None
    centro_custo: Optional[str] = None


class ServicoLavanderiaResponse(ServicoLavanderiaBase):
    """Serviço de lavanderia response schema."""

    id: UUID
    tenant_id: UUID
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
