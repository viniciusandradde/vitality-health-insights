"""Mappers for ERP dashboard integrations."""
from app.integrations.erp.mappers.indicadores_gerais import IndicadoresGeraisMapper
from app.integrations.erp.mappers.internacoes import InternacoesMapper
from app.integrations.erp.mappers.ocupacao_leitos import OcupacaoLeitosMapper
from app.integrations.erp.mappers.atendimentos import AtendimentosMapper

__all__ = [
    "IndicadoresGeraisMapper",
    "InternacoesMapper",
    "OcupacaoLeitosMapper",
    "AtendimentosMapper",
]
