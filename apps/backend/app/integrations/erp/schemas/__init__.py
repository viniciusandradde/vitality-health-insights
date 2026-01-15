"""Schemas for ERP dashboard integrations."""
# Import dashboard schemas
from app.integrations.erp.schemas.indicadores_gerais import IndicadoresGeraisResponse
from app.integrations.erp.schemas.internacoes import InternacoesDashboardResponse
from app.integrations.erp.schemas.ocupacao_leitos import OcupacaoLeitosDashboardResponse
from app.integrations.erp.schemas.atendimentos import AtendimentosDashboardResponse

# Import legacy schemas from schemas.py (for backward compatibility)
# Use importlib to load the schemas.py file directly to avoid circular import
import importlib.util
from pathlib import Path

parent_dir = Path(__file__).parent.parent
schemas_file = parent_dir / "schemas.py"

spec = importlib.util.spec_from_file_location("erp_schemas_legacy", schemas_file)
legacy_schemas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy_schemas)

# Re-export legacy schemas
AtendimentoListResponse = legacy_schemas.AtendimentoListResponse
EstoqueListResponse = legacy_schemas.EstoqueListResponse
FaturamentoListResponse = legacy_schemas.FaturamentoListResponse
InternacaoListResponse = legacy_schemas.InternacaoListResponse
PacienteListResponse = legacy_schemas.PacienteListResponse
ERPHealthResponse = legacy_schemas.ERPHealthResponse

__all__ = [
    # Dashboard schemas
    "IndicadoresGeraisResponse",
    "InternacoesDashboardResponse",
    "OcupacaoLeitosDashboardResponse",
    "AtendimentosDashboardResponse",
    # Legacy schemas
    "AtendimentoListResponse",
    "EstoqueListResponse",
    "FaturamentoListResponse",
    "InternacaoListResponse",
    "PacienteListResponse",
    "ERPHealthResponse",
]
