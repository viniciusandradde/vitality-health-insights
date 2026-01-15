"""Dashboard atendimentos schemas."""
from typing import List
from pydantic import BaseModel


class AtendimentoDashboardItem(BaseModel):
    """Atendimento dashboard item."""

    id: str
    paciente_nome: str
    data: str
    especialidade: str
    tipo: str
    status: str
    convenio: str

    class Config:
        from_attributes = True


class AtendimentosResponse(BaseModel):
    """Atendimentos response schema."""

    total: int
    hoje: int
    por_especialidade: dict[str, int]
    por_tipo: dict[str, int]
    por_convenio: dict[str, int]
    items: List[AtendimentoDashboardItem]
