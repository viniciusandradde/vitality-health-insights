"""Mappers for ERP dashboard integrations."""
from app.integrations.erp.mappers.indicadores_gerais import IndicadoresGeraisMapper
from app.integrations.erp.mappers.internacoes import InternacoesMapper
from app.integrations.erp.mappers.ocupacao_leitos import OcupacaoLeitosMapper
from app.integrations.erp.mappers.atendimentos import AtendimentosMapper

# Import legacy mappers from mappers.py (for backward compatibility)
import importlib.util
from pathlib import Path

parent_dir = Path(__file__).parent.parent
legacy_mappers_file = parent_dir / "mappers.py"

spec = importlib.util.spec_from_file_location("erp_mappers_legacy", legacy_mappers_file)
legacy_mappers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy_mappers)

AtendimentoMapper = legacy_mappers.AtendimentoMapper
EstoqueMapper = legacy_mappers.EstoqueMapper
FaturamentoMapper = legacy_mappers.FaturamentoMapper
InternacaoMapper = legacy_mappers.InternacaoMapper
PacienteMapper = legacy_mappers.PacienteMapper

__all__ = [
    "IndicadoresGeraisMapper",
    "InternacoesMapper",
    "OcupacaoLeitosMapper",
    "AtendimentosMapper",
    # Legacy mappers
    "AtendimentoMapper",
    "EstoqueMapper",
    "FaturamentoMapper",
    "InternacaoMapper",
    "PacienteMapper",
]
