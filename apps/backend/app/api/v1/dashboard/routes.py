"""Dashboard routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.atendimentos import Atendimento
from app.models.assistencial.internacao import Internacao, Leito
from app.models.user import User
from app.schemas.dashboard.atendimentos import AtendimentosResponse
from app.schemas.dashboard.internacoes import InternacoesResponse
from app.schemas.dashboard.kpis import KPIsResponse
from app.schemas.dashboard.ocupacao import OcupacaoResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=KPIsResponse, status_code=status.HTTP_200_OK)
async def get_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get general KPIs."""
    # Total internacoes
    result = await db.execute(
        select(func.count(Internacao.id)).where(Internacao.tenant_id == tenant_id)
    )
    total_internacoes = result.scalar() or 0

    # Total atendimentos
    result = await db.execute(
        select(func.count(Atendimento.id)).where(Atendimento.tenant_id == tenant_id)
    )
    total_atendimentos = result.scalar() or 0

    # Total leitos
    result = await db.execute(
        select(func.count(Leito.id)).where(Leito.tenant_id == tenant_id)
    )
    total_leitos = result.scalar() or 0

    # Leitos ocupados
    result = await db.execute(
        select(func.count(Leito.id)).where(
            Leito.tenant_id == tenant_id, Leito.status == "ocupado"
        )
    )
    leitos_ocupados = result.scalar() or 0

    leitos_disponiveis = total_leitos - leitos_ocupados
    taxa_ocupacao = (
        (leitos_ocupados / total_leitos * 100) if total_leitos > 0 else 0
    )

    return KPIsResponse(
        total_internacoes=total_internacoes,
        total_atendimentos=total_atendimentos,
        taxa_ocupacao=taxa_ocupacao,
        tempo_medio_permanencia=0,  # TODO: Calculate
        total_leitos=total_leitos,
        leitos_ocupados=leitos_ocupados,
        leitos_disponiveis=leitos_disponiveis,
        pacientes_dia=0,  # TODO: Calculate
        leitos_dia=0,  # TODO: Calculate
    )


@router.get(
    "/internacoes", response_model=InternacoesResponse, status_code=status.HTTP_200_OK
)
async def get_internacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get internacoes data."""
    # Get internacoes
    result = await db.execute(
        select(Internacao)
        .where(Internacao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    internacoes = list(result.scalars().all())

    # Counts
    total = len(internacoes)
    internados = sum(1 for i in internacoes if i.status == "internado")
    altas = sum(1 for i in internacoes if i.status in ["alta_medica", "alta_pedida"])
    obitos = sum(1 for i in internacoes if i.obito)
    transferencias = sum(1 for i in internacoes if i.status == "transferencia")

    return InternacoesResponse(
        total=total,
        internados=internados,
        altas=altas,
        obitos=obitos,
        transferencias=transferencias,
        items=internacoes,
        taxa_ocupacao=0,  # TODO: Calculate
        tempo_medio_permanencia=0,  # TODO: Calculate
    )


@router.get(
    "/ocupacao-leitos",
    response_model=OcupacaoResponse,
    status_code=status.HTTP_200_OK,
)
async def get_ocupacao_leitos(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get leitos ocupacao data."""
    # Get all leitos
    result = await db.execute(
        select(Leito).where(Leito.tenant_id == tenant_id)
    )
    leitos = list(result.scalars().all())

    total_leitos = len(leitos)
    leitos_ocupados = sum(1 for l in leitos if l.status == "ocupado")
    leitos_disponiveis = total_leitos - leitos_ocupados
    taxa_ocupacao_geral = (
        (leitos_ocupados / total_leitos * 100) if total_leitos > 0 else 0
    )

    # Group by centro_custo
    por_centro_custo = {}
    for leito in leitos:
        cc = leito.centro_custo
        if cc not in por_centro_custo:
            por_centro_custo[cc] = {"total": 0, "ocupados": 0}
        por_centro_custo[cc]["total"] += 1
        if leito.status == "ocupado":
            por_centro_custo[cc]["ocupados"] += 1

    # Group by tipo
    por_tipo = {}
    for leito in leitos:
        tipo = leito.tipo
        por_tipo[tipo] = por_tipo.get(tipo, 0) + 1

    return OcupacaoResponse(
        total_leitos=total_leitos,
        leitos_ocupados=leitos_ocupados,
        leitos_disponiveis=leitos_disponiveis,
        taxa_ocupacao_geral=taxa_ocupacao_geral,
        por_centro_custo=[],  # TODO: Format properly
        por_tipo=por_tipo,
        por_convenio={},  # TODO: Calculate from internacoes
    )


@router.get(
    "/atendimentos",
    response_model=AtendimentosResponse,
    status_code=status.HTTP_200_OK,
)
async def get_atendimentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get atendimentos data."""
    # Get atendimentos
    result = await db.execute(
        select(Atendimento)
        .where(Atendimento.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    atendimentos = list(result.scalars().all())

    # Counts
    total = len(atendimentos)
    hoje = sum(1 for a in atendimentos if a.data == "2025-01-14")  # TODO: Use today

    # Group by especialidade
    por_especialidade = {}
    for atendimento in atendimentos:
        esp = atendimento.especialidade
        por_especialidade[esp] = por_especialidade.get(esp, 0) + 1

    # Group by tipo
    por_tipo = {}
    for atendimento in atendimentos:
        tipo = atendimento.tipo
        por_tipo[tipo] = por_tipo.get(tipo, 0) + 1

    # Group by convenio
    por_convenio = {}
    for atendimento in atendimentos:
        conv = atendimento.convenio
        por_convenio[conv] = por_convenio.get(conv, 0) + 1

    return AtendimentosResponse(
        total=total,
        hoje=hoje,
        por_especialidade=por_especialidade,
        por_tipo=por_tipo,
        por_convenio=por_convenio,
        items=atendimentos,
    )


@router.get("/indicadores", status_code=status.HTTP_200_OK)
async def get_indicadores_gerais(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get general indicators."""
    # TODO: Implement comprehensive indicators
    return {
        "indicadores": [],
        "graficos": {},
    }


@router.get("/graficos/{tipo}", status_code=status.HTTP_200_OK)
async def get_grafico_data(
    tipo: str,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chart data by type."""
    # TODO: Implement chart data endpoints
    return {"tipo": tipo, "data": []}
