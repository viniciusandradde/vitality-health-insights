"""Schemas for ERP dashboard integrations."""
from app.integrations.erp.schemas.indicadores_gerais import IndicadoresGeraisResponse
from app.integrations.erp.schemas.internacoes import InternacoesDashboardResponse
from app.integrations.erp.schemas.ocupacao_leitos import OcupacaoLeitosDashboardResponse
from app.integrations.erp.schemas.atendimentos import AtendimentosDashboardResponse

__all__ = [
    "IndicadoresGeraisResponse",
    "InternacoesDashboardResponse",
    "OcupacaoLeitosDashboardResponse",
    "AtendimentosDashboardResponse",
]
