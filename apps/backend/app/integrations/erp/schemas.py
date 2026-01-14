"""ERP integration schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# Request schemas
class ERPQueryParams(BaseModel):
    """Base query parameters."""

    limit: int = Field(20, ge=1, le=1000, description="Number of records to return")
    offset: int = Field(0, ge=0, description="Number of records to skip")


class ERPDateRangeParams(ERPQueryParams):
    """Query parameters with date range."""

    data_inicio: str = Field(..., description="Start date (YYYY-MM-DD)")
    data_fim: str = Field(..., description="End date (YYYY-MM-DD)")


class ERPFilterParams(ERPQueryParams):
    """Query parameters with filters."""

    categoria: Optional[str] = Field(None, description="Filter by category")


# Response schemas - ERP raw data
class ERPPacienteRaw(BaseModel):
    """Raw paciente data from ERP."""

    codigo_erp: Optional[str] = None
    nome: Optional[str] = None
    cpf: Optional[str] = None
    data_nascimento: Optional[str] = None
    sexo: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None


class ERPAtendimentoRaw(BaseModel):
    """Raw atendimento/movimentação data from ERP."""

    # Nova estrutura de movimentação
    componente: Optional[str] = None
    admissoes_hoje: Optional[int] = None
    altas_hoje: Optional[int] = None
    transferencias_hoje: Optional[int] = None
    tempo_medio_permanencia: Optional[float] = None
    
    # Estrutura antiga (mantida para compatibilidade)
    numero_atendimento: Optional[str] = None
    tipo_atendimento: Optional[str] = None
    nome_paciente: Optional[str] = None
    hora_entrada: Optional[str] = None
    hora_saida: Optional[str] = None
    tempo_permanencia_minutos: Optional[float] = None
    prestador: Optional[str] = None
    especialidade: Optional[str] = None
    convenio: Optional[str] = None
    diagnostico: Optional[str] = None


class ERPFaturamentoRaw(BaseModel):
    """Raw faturamento data from ERP."""

    codigo_erp: Optional[str] = None
    paciente_id: Optional[str] = None
    paciente_nome: Optional[str] = None
    data_faturamento: Optional[str] = None
    data_vencimento: Optional[str] = None
    valor_total: Optional[float] = None
    valor_pago: Optional[float] = None
    status: Optional[str] = None
    convenio: Optional[str] = None
    tipo_faturamento: Optional[str] = None


class ERPEstoqueRaw(BaseModel):
    """Raw estoque data from ERP."""

    codigo_erp: Optional[str] = None
    item_codigo: Optional[str] = None
    item_descricao: Optional[str] = None
    categoria: Optional[str] = None
    quantidade_atual: Optional[float] = None
    quantidade_minima: Optional[float] = None
    quantidade_maxima: Optional[float] = None
    unidade_medida: Optional[str] = None
    valor_unitario: Optional[float] = None
    localizacao: Optional[str] = None
    fornecedor: Optional[str] = None
    data_ultima_entrada: Optional[str] = None
    data_ultima_saida: Optional[str] = None


class ERPInternacaoRaw(BaseModel):
    """Raw internacao data from ERP."""

    codigo_erp: Optional[str] = None
    paciente_id: Optional[str] = None
    paciente_nome: Optional[str] = None
    paciente_cpf: Optional[str] = None
    data_entrada: Optional[str] = None
    hora_entrada: Optional[str] = None
    data_saida: Optional[str] = None
    hora_saida: Optional[str] = None
    leito_numero: Optional[str] = None
    leito_tipo: Optional[str] = None
    especialidade: Optional[str] = None
    medico_responsavel: Optional[str] = None
    convenio: Optional[str] = None
    tipo_internacao: Optional[str] = None
    status: Optional[str] = None
    valor_total: Optional[float] = None


# Response schemas - Mapped domain data
class PacienteDomain(BaseModel):
    """Paciente in internal domain format."""

    codigo_erp: Optional[str] = None
    nome: Optional[str] = None
    cpf: Optional[str] = None
    data_nascimento: Optional[str] = None
    sexo: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None


class AtendimentoDomain(BaseModel):
    """Atendimento/Movimentação in internal domain format."""

    # Nova estrutura de movimentação
    componente: Optional[str] = None
    admissoes_hoje: Optional[int] = None
    altas_hoje: Optional[int] = None
    transferencias_hoje: Optional[int] = None
    tempo_medio_permanencia: Optional[float] = None
    
    # Estrutura antiga (mantida para compatibilidade)
    codigo_erp: Optional[str] = None
    numero_atendimento: Optional[str] = None
    tipo_atendimento: Optional[str] = None
    nome_paciente: Optional[str] = None
    hora_entrada: Optional[str] = None
    hora_saida: Optional[str] = None
    tempo_permanencia_minutos: Optional[float] = None
    prestador: Optional[str] = None
    especialidade: Optional[str] = None
    convenio: Optional[str] = None
    diagnostico: Optional[str] = None


class FaturamentoDomain(BaseModel):
    """Faturamento in internal domain format."""

    codigo_erp: Optional[str] = None
    paciente_id: Optional[str] = None
    paciente_nome: Optional[str] = None
    data_faturamento: Optional[str] = None
    data_vencimento: Optional[str] = None
    valor_total: Optional[float] = None
    valor_pago: Optional[float] = None
    status: Optional[str] = None
    convenio: Optional[str] = None
    tipo_faturamento: Optional[str] = None


class EstoqueDomain(BaseModel):
    """Estoque in internal domain format."""

    codigo_erp: Optional[str] = None
    codigo: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    quantidade_atual: Optional[float] = None
    quantidade_minima: Optional[float] = None
    quantidade_maxima: Optional[float] = None
    unidade_medida: Optional[str] = None
    valor_unitario: Optional[float] = None
    localizacao: Optional[str] = None
    fornecedor: Optional[str] = None
    data_ultima_entrada: Optional[str] = None
    data_ultima_saida: Optional[str] = None


class InternacaoDomain(BaseModel):
    """Internacao in internal domain format."""

    codigo_erp: Optional[str] = None
    paciente_id: Optional[str] = None
    paciente_nome: Optional[str] = None
    paciente_cpf: Optional[str] = None
    data_entrada: Optional[str] = None
    hora_entrada: Optional[str] = None
    data_saida: Optional[str] = None
    hora_saida: Optional[str] = None
    leito_numero: Optional[str] = None
    leito_tipo: Optional[str] = None
    especialidade: Optional[str] = None
    medico_responsavel: Optional[str] = None
    convenio: Optional[str] = None
    tipo_internacao: Optional[str] = None
    status: Optional[str] = None
    valor_total: Optional[float] = None


# List response schemas
class PacienteListResponse(BaseModel):
    """Response for paciente list."""

    items: list[PacienteDomain]
    total: int
    limit: int
    offset: int


class AtendimentoListResponse(BaseModel):
    """Response for atendimento list."""

    items: list[AtendimentoDomain]
    total: int
    limit: int
    offset: int


class FaturamentoListResponse(BaseModel):
    """Response for faturamento list."""

    items: list[FaturamentoDomain]
    total: int
    limit: int
    offset: int


class EstoqueListResponse(BaseModel):
    """Response for estoque list."""

    items: list[EstoqueDomain]
    total: int
    limit: int
    offset: int


class InternacaoListResponse(BaseModel):
    """Response for internacao list."""

    items: list[InternacaoDomain]
    total: int
    limit: int
    offset: int


# Health check schema
class ERPHealthResponse(BaseModel):
    """ERP health check response."""

    connected: bool
    erp_type: str
    database: str
    message: Optional[str] = None
