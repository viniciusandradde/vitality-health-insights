"""ERP integration routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.integrations.erp.config import ERPConfig
from app.integrations.erp.exceptions import (
    ERPConfigurationError,
    ERPConnectionError,
    ERPRateLimitError,
    ERPTimeoutError,
)
from app.integrations.erp.schemas import (
    AtendimentoListResponse,
    EstoqueListResponse,
    FaturamentoListResponse,
    InternacaoListResponse,
    PacienteListResponse,
    ERPHealthResponse,
)
from app.integrations.erp.service import ERPService
from app.models.user import User

router = APIRouter(prefix="/erp", tags=["Integrations - ERP"])


async def get_erp_service(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
) -> ERPService:
    """Dependency to get ERP service for current tenant."""
    config = await ERPConfig.from_tenant(tenant_id, db)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ERP integration not configured for this tenant",
        )
    return ERPService(config)


@router.get("/health", response_model=ERPHealthResponse, status_code=status.HTTP_200_OK)
async def check_erp_health(
    erp_service: ERPService = Depends(get_erp_service),
):
    """Check ERP connection health."""
    try:
        connected = await erp_service.test_connection()
        return ERPHealthResponse(
            connected=connected,
            erp_type=erp_service.config.erp_type,
            database=erp_service.config.database,
            message="Connected" if connected else "Connection failed",
        )
    except Exception as e:
        return ERPHealthResponse(
            connected=False,
            erp_type=erp_service.config.erp_type,
            database=erp_service.config.database,
            message=str(e),
        )


@router.get(
    "/pacientes",
    response_model=PacienteListResponse,
    status_code=status.HTTP_200_OK,
)
async def get_pacientes(
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Get pacientes from ERP."""
    try:
        items = await erp_service.get_pacientes(limit=limit, offset=offset)
        return PacienteListResponse(
            items=items,
            total=len(items),  # TODO: Get actual total from ERP
            limit=limit,
            offset=offset,
        )
    except ERPRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
        )
    except (ERPConnectionError, ERPTimeoutError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pacientes: {e}",
        )


@router.get(
    "/atendimentos",
    response_model=AtendimentoListResponse,
    status_code=status.HTTP_200_OK,
)
async def get_atendimentos(
    data_inicio: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Get atendimentos from ERP."""
    try:
        items = await erp_service.get_atendimentos(
            data_inicio=data_inicio,
            data_fim=data_fim,
            limit=limit,
            offset=offset,
        )
        return AtendimentoListResponse(
            items=items,
            total=len(items),  # TODO: Get actual total from ERP
            limit=limit,
            offset=offset,
        )
    except ERPRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
        )
    except (ERPConnectionError, ERPTimeoutError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching atendimentos: {e}",
        )


@router.get(
    "/faturamento",
    response_model=FaturamentoListResponse,
    status_code=status.HTTP_200_OK,
)
async def get_faturamento(
    data_inicio: str = Query(..., description="Start date (YYYY-MM-DD)"),
    data_fim: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Get faturamento from ERP."""
    try:
        items = await erp_service.get_faturamento(
            data_inicio=data_inicio,
            data_fim=data_fim,
            limit=limit,
            offset=offset,
        )
        return FaturamentoListResponse(
            items=items,
            total=len(items),  # TODO: Get actual total from ERP
            limit=limit,
            offset=offset,
        )
    except ERPRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
        )
    except (ERPConnectionError, ERPTimeoutError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching faturamento: {e}",
        )


@router.get(
    "/estoque",
    response_model=EstoqueListResponse,
    status_code=status.HTTP_200_OK,
)
async def get_estoque(
    categoria: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Get estoque from ERP."""
    try:
        items = await erp_service.get_estoque(
            categoria=categoria, limit=limit, offset=offset
        )
        return EstoqueListResponse(
            items=items,
            total=len(items),  # TODO: Get actual total from ERP
            limit=limit,
            offset=offset,
        )
    except ERPRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
        )
    except (ERPConnectionError, ERPTimeoutError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching estoque: {e}",
        )


@router.get(
    "/internacoes",
    response_model=InternacaoListResponse,
    status_code=status.HTTP_200_OK,
)
async def get_internacoes(
    data_inicio: str = Query(..., description="Start date (YYYY-MM-DD)"),
    data_fim: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Get internacoes from ERP."""
    try:
        items = await erp_service.get_internacoes(
            data_inicio=data_inicio,
            data_fim=data_fim,
            limit=limit,
            offset=offset,
        )
        return InternacaoListResponse(
            items=items,
            total=len(items),  # TODO: Get actual total from ERP
            limit=limit,
            offset=offset,
        )
    except ERPRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e)
        )
    except (ERPConnectionError, ERPTimeoutError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching internacoes: {e}",
        )


@router.post(
    "/cache/invalidate",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def invalidate_cache(
    domain: Optional[str] = Query(None, description="Domain to invalidate (optional)"),
    erp_service: ERPService = Depends(get_erp_service),
    current_user: User = Depends(get_current_user),
):
    """Invalidate ERP cache for current tenant."""
    await erp_service.invalidate_cache(domain)
    return None
