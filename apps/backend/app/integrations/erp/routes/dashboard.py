"""FastAPI routes for ERP dashboard integrations."""
import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from uuid import UUID

from app.api.v1.auth.dependencies import get_current_tenant_id, get_current_user
from app.integrations.erp.services.ocupacao_leitos import OcupacaoLeitosService
from app.integrations.erp.services.internacoes import InternacoesService
from app.integrations.erp.services.atendimentos import AtendimentosService
from app.integrations.erp.services.indicadores_gerais import IndicadoresGeraisService
from app.integrations.erp.schemas.ocupacao_leitos import OcupacaoLeitosDashboardResponse
from app.integrations.erp.schemas.internacoes import InternacoesDashboardResponse
from app.integrations.erp.schemas.atendimentos import AtendimentosDashboardResponse
from app.integrations.erp.schemas.indicadores_gerais import IndicadoresGeraisResponse
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard ERP"])


@router.get("/indicadores-gerais", response_model=IndicadoresGeraisResponse)
async def get_indicadores_gerais(
    periodo: str = Query("dia", enum=["dia", "semana", "mes"]),
    setor: Optional[str] = Query(None),
    tenant_id: UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
):
    """
    Dashboard: IndicadoresGeraisDashboard
    Retorna KPIs gerais, atendimentos por hora, ocupacao semanal, etc.
    """
    try:
        logger.info(f"Fetching indicadores gerais for tenant {tenant_id}, periodo={periodo}, setor={setor}")
        service = await IndicadoresGeraisService.create(tenant_id)
        return await service.get_dashboard_completo(periodo=periodo, setor=setor)
    except ValueError as e:
        logger.error(f"ValueError in indicadores_gerais: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.exception(f"Unexpected error in indicadores_gerais: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}",
        )


@router.get("/internacoes", response_model=InternacoesDashboardResponse)
async def get_internacoes_dashboard(
    periodo: str = Query("mes", enum=["dia", "mes"]),
    centro_custo: Optional[str] = Query(None),
    tenant_id: UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
):
    """
    Dashboard: InternacoesDashboard
    Retorna indicadores de internacao, entradas/saidas, ocupacao por CC.
    """
    try:
        service = await InternacoesService.create(tenant_id)
        return await service.get_dashboard_completo(periodo=periodo, centro_custo=centro_custo)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}",
        )


@router.get("/ocupacao-leitos", response_model=OcupacaoLeitosDashboardResponse)
async def get_ocupacao_leitos_dashboard(
    periodo: str = Query("mes", enum=["dia", "mes"]),
    centro_custo: Optional[str] = Query(None),
    tenant_id: UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
):
    """
    Dashboard: OcupacaoLeitosDashboard
    Retorna cards operacionais, donut, tabela por CC, pie charts.
    """
    try:
        service = await OcupacaoLeitosService.create(tenant_id)
        return await service.get_dashboard_completo(periodo=periodo, centro_custo=centro_custo)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}",
        )


@router.get("/atendimentos", response_model=AtendimentosDashboardResponse)
async def get_atendimentos_dashboard(
    periodo: str = Query("mes", enum=["dia", "mes"]),
    centro_custo: Optional[str] = Query(None),
    tenant_id: UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
):
    """
    Dashboard: AtendimentosDashboard
    Retorna atendimentos ambulatoriais, por tipo, convenio, especialidade.
    """
    try:
        logger.info(f"Fetching atendimentos for tenant {tenant_id}, periodo={periodo}, centro_custo={centro_custo}")
        service = await AtendimentosService.create(tenant_id)
        return await service.get_dashboard_completo(periodo=periodo, centro_custo=centro_custo)
    except ValueError as e:
        logger.error(f"ValueError in atendimentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.exception(f"Unexpected error in atendimentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}",
        )
