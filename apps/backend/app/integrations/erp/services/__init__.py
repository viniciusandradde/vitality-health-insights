"""Services for ERP dashboard integrations."""
from app.integrations.erp.services.indicadores_gerais import IndicadoresGeraisService
from app.integrations.erp.services.internacoes import InternacoesService
from app.integrations.erp.services.ocupacao_leitos import OcupacaoLeitosService
from app.integrations.erp.services.atendimentos import AtendimentosService

__all__ = [
    "IndicadoresGeraisService",
    "InternacoesService",
    "OcupacaoLeitosService",
    "AtendimentosService",
]
