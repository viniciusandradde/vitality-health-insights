"""ERP data mappers - translate ERP data to internal domain."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

from app.integrations.erp.exceptions import ERPMappingError


class BaseMapper:
    """Base mapper class."""

    @staticmethod
    def normalize_date(date_value: Any) -> Optional[str]:
        """Normalize date to ISO format string."""
        if not date_value:
            return None

        if isinstance(date_value, datetime):
            return date_value.isoformat()
        if isinstance(date_value, str):
            try:
                # Try to parse common date formats
                for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"]:
                    try:
                        dt = datetime.strptime(date_value, fmt)
                        return dt.isoformat()
                    except ValueError:
                        continue
                return date_value
            except Exception:
                return date_value
        return str(date_value)

    @staticmethod
    def normalize_string(value: Any, max_length: Optional[int] = None) -> Optional[str]:
        """Normalize string value."""
        if value is None:
            return None
        str_value = str(value).strip()
        if max_length and len(str_value) > max_length:
            str_value = str_value[:max_length]
        return str_value if str_value else None

    @staticmethod
    def normalize_decimal(value: Any) -> Optional[float]:
        """Normalize decimal value."""
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def normalize_integer(value: Any) -> Optional[int]:
        """Normalize integer value."""
        if value is None:
            return None
        try:
            # Se for string, remover espaços e converter
            if isinstance(value, str):
                value = value.strip()
                if not value or value == '':
                    return None
            return int(float(value))  # Usar float primeiro para lidar com "2.58" -> 2
        except (ValueError, TypeError):
            return None


class PacienteMapper(BaseMapper):
    """Mapper for Paciente data."""

    @staticmethod
    def map_erp_to_domain(erp_data: dict[str, Any]) -> dict[str, Any]:
        """Map ERP paciente data to internal domain."""
        try:
            return {
                "codigo_erp": PacienteMapper.normalize_string(erp_data.get("codigo_erp")),
                "nome": PacienteMapper.normalize_string(erp_data.get("nome"), 255),
                "cpf": PacienteMapper.normalize_string(erp_data.get("cpf"), 14),
                "data_nascimento": PacienteMapper.normalize_date(erp_data.get("data_nascimento")),
                "sexo": PacienteMapper.normalize_string(erp_data.get("sexo"), 1),
                "telefone": PacienteMapper.normalize_string(erp_data.get("telefone"), 20),
                "email": PacienteMapper.normalize_string(erp_data.get("email"), 255),
                "endereco": PacienteMapper.normalize_string(erp_data.get("endereco"), 255),
                "cidade": PacienteMapper.normalize_string(erp_data.get("cidade"), 100),
                "estado": PacienteMapper.normalize_string(erp_data.get("estado"), 2),
                "cep": PacienteMapper.normalize_string(erp_data.get("cep"), 10),
            }
        except Exception as e:
            raise ERPMappingError(f"Error mapping paciente data: {e}") from e


class AtendimentoMapper(BaseMapper):
    """Mapper for Atendimento/Movimentação data."""

    @staticmethod
    def map_erp_to_domain(erp_data: dict[str, Any]) -> dict[str, Any]:
        """Map ERP atendimento/movimentação data to internal domain."""
        try:
            # Verificar se é a nova estrutura de movimentação
            componente = str(erp_data.get("componente", "")).strip()
            if componente == "CARDS_MOVIMENTACAO":
                # Converter valores - podem vir como int, string ou None do banco
                admissoes = AtendimentoMapper.normalize_integer(erp_data.get("admissoes_hoje"))
                altas = AtendimentoMapper.normalize_integer(erp_data.get("altas_hoje"))
                transferencias = AtendimentoMapper.normalize_integer(erp_data.get("transferencias_hoje"))
                tempo_medio = AtendimentoMapper.normalize_decimal(erp_data.get("tempo_medio_permanencia"))
                
                return {
                    "componente": AtendimentoMapper.normalize_string(componente),
                    "admissoes_hoje": admissoes if admissoes is not None else 0,
                    "altas_hoje": altas if altas is not None else 0,
                    "transferencias_hoje": transferencias if transferencias is not None else 0,
                    "tempo_medio_permanencia": tempo_medio,
                }
            else:
                # Estrutura antiga (mantida para compatibilidade)
                return {
                    "codigo_erp": AtendimentoMapper.normalize_string(str(erp_data.get("numero_atendimento"))),
                    "numero_atendimento": AtendimentoMapper.normalize_string(str(erp_data.get("numero_atendimento"))),
                    "tipo_atendimento": AtendimentoMapper.normalize_string(erp_data.get("tipo_atendimento"), 50),
                    "nome_paciente": AtendimentoMapper.normalize_string(erp_data.get("nome_paciente"), 255),
                    "hora_entrada": AtendimentoMapper.normalize_date(erp_data.get("hora_entrada")),
                    "hora_saida": AtendimentoMapper.normalize_date(erp_data.get("hora_saida")),
                    "tempo_permanencia_minutos": AtendimentoMapper.normalize_decimal(erp_data.get("tempo_permanencia_minutos")),
                    "prestador": AtendimentoMapper.normalize_string(erp_data.get("prestador"), 255),
                    "especialidade": AtendimentoMapper.normalize_string(erp_data.get("especialidade"), 100),
                    "convenio": AtendimentoMapper.normalize_string(erp_data.get("convenio"), 100),
                    "diagnostico": AtendimentoMapper.normalize_string(erp_data.get("diagnostico"), 255),
                }
        except Exception as e:
            raise ERPMappingError(f"Error mapping atendimento data: {e}") from e


class FaturamentoMapper(BaseMapper):
    """Mapper for Faturamento data."""

    @staticmethod
    def map_erp_to_domain(erp_data: dict[str, Any]) -> dict[str, Any]:
        """Map ERP faturamento data to internal domain."""
        try:
            return {
                "codigo_erp": FaturamentoMapper.normalize_string(erp_data.get("codigo_erp")),
                "paciente_id": FaturamentoMapper.normalize_string(erp_data.get("paciente_id")),
                "paciente_nome": FaturamentoMapper.normalize_string(erp_data.get("paciente_nome"), 255),
                "data_faturamento": FaturamentoMapper.normalize_date(erp_data.get("data_faturamento")),
                "data_vencimento": FaturamentoMapper.normalize_date(erp_data.get("data_vencimento")),
                "valor_total": FaturamentoMapper.normalize_decimal(erp_data.get("valor_total")),
                "valor_pago": FaturamentoMapper.normalize_decimal(erp_data.get("valor_pago")),
                "status": FaturamentoMapper.normalize_string(erp_data.get("status"), 50),
                "convenio": FaturamentoMapper.normalize_string(erp_data.get("convenio"), 100),
                "tipo_faturamento": FaturamentoMapper.normalize_string(erp_data.get("tipo_faturamento"), 50),
            }
        except Exception as e:
            raise ERPMappingError(f"Error mapping faturamento data: {e}") from e


class EstoqueMapper(BaseMapper):
    """Mapper for Estoque data."""

    @staticmethod
    def map_erp_to_domain(erp_data: dict[str, Any]) -> dict[str, Any]:
        """Map ERP estoque data to internal domain."""
        try:
            return {
                "codigo_erp": EstoqueMapper.normalize_string(erp_data.get("codigo_erp")),
                "codigo": EstoqueMapper.normalize_string(erp_data.get("item_codigo")),
                "descricao": EstoqueMapper.normalize_string(erp_data.get("item_descricao"), 255),
                "categoria": EstoqueMapper.normalize_string(erp_data.get("categoria"), 100),
                "quantidade_atual": EstoqueMapper.normalize_decimal(erp_data.get("quantidade_atual")),
                "quantidade_minima": EstoqueMapper.normalize_decimal(erp_data.get("quantidade_minima")),
                "quantidade_maxima": EstoqueMapper.normalize_decimal(erp_data.get("quantidade_maxima")),
                "unidade_medida": EstoqueMapper.normalize_string(erp_data.get("unidade_medida"), 20),
                "valor_unitario": EstoqueMapper.normalize_decimal(erp_data.get("valor_unitario")),
                "localizacao": EstoqueMapper.normalize_string(erp_data.get("localizacao"), 100),
                "fornecedor": EstoqueMapper.normalize_string(erp_data.get("fornecedor"), 255),
                "data_ultima_entrada": EstoqueMapper.normalize_date(erp_data.get("data_ultima_entrada")),
                "data_ultima_saida": EstoqueMapper.normalize_date(erp_data.get("data_ultima_saida")),
            }
        except Exception as e:
            raise ERPMappingError(f"Error mapping estoque data: {e}") from e


class InternacaoMapper(BaseMapper):
    """Mapper for Internacao data."""

    @staticmethod
    def map_erp_to_domain(erp_data: dict[str, Any]) -> dict[str, Any]:
        """Map ERP internacao data to internal domain."""
        try:
            return {
                "codigo_erp": InternacaoMapper.normalize_string(erp_data.get("codigo_erp")),
                "paciente_id": InternacaoMapper.normalize_string(erp_data.get("paciente_id")),
                "paciente_nome": InternacaoMapper.normalize_string(erp_data.get("paciente_nome"), 255),
                "paciente_cpf": InternacaoMapper.normalize_string(erp_data.get("paciente_cpf"), 14),
                "data_entrada": InternacaoMapper.normalize_date(erp_data.get("data_entrada")),
                "hora_entrada": InternacaoMapper.normalize_string(erp_data.get("hora_entrada"), 10),
                "data_saida": InternacaoMapper.normalize_date(erp_data.get("data_saida")),
                "hora_saida": InternacaoMapper.normalize_string(erp_data.get("hora_saida"), 10),
                "leito_numero": InternacaoMapper.normalize_string(erp_data.get("leito_numero"), 50),
                "leito_tipo": InternacaoMapper.normalize_string(erp_data.get("leito_tipo"), 50),
                "especialidade": InternacaoMapper.normalize_string(erp_data.get("especialidade"), 100),
                "medico_responsavel": InternacaoMapper.normalize_string(erp_data.get("medico_responsavel"), 255),
                "convenio": InternacaoMapper.normalize_string(erp_data.get("convenio"), 100),
                "tipo_internacao": InternacaoMapper.normalize_string(erp_data.get("tipo_internacao"), 50),
                "status": InternacaoMapper.normalize_string(erp_data.get("status"), 50),
                "valor_total": InternacaoMapper.normalize_decimal(erp_data.get("valor_total")),
            }
        except Exception as e:
            raise ERPMappingError(f"Error mapping internacao data: {e}") from e
