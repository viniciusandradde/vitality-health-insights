"""Dashboard schemas."""
from app.schemas.dashboard.kpis import KPIsResponse
from app.schemas.dashboard.internacoes import InternacoesResponse
from app.schemas.dashboard.ocupacao import OcupacaoResponse
from app.schemas.dashboard.atendimentos import AtendimentosResponse

__all__ = [
    "KPIsResponse",
    "InternacoesResponse",
    "OcupacaoResponse",
    "AtendimentosResponse",
]
