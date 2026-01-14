"""Ambulatorio routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.ambulatorio import AmbulatorioConsulta
from app.models.user import User
from app.schemas.assistencial.ambulatorio import (
    AmbulatorioConsultaCreate,
    AmbulatorioConsultaResponse,
    AmbulatorioConsultaUpdate,
)

router = APIRouter(prefix="/ambulatorio", tags=["Assistencial - Ambulatório"])


@router.get("", response_model=List[AmbulatorioConsultaResponse], status_code=status.HTTP_200_OK)
async def list_ambulatorio_consultas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List ambulatorio consultas."""
    result = await db.execute(
        select(AmbulatorioConsulta)
        .where(AmbulatorioConsulta.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    consultas = list(result.scalars().all())
    return consultas


@router.post("", response_model=AmbulatorioConsultaResponse, status_code=status.HTTP_201_CREATED)
async def create_ambulatorio_consulta(
    consulta_data: AmbulatorioConsultaCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create ambulatorio consulta."""
    consulta = AmbulatorioConsulta(**consulta_data.model_dump(), tenant_id=tenant_id)
    db.add(consulta)
    await db.commit()
    await db.refresh(consulta)
    return consulta


@router.get("/{consulta_id}", response_model=AmbulatorioConsultaResponse, status_code=status.HTTP_200_OK)
async def get_ambulatorio_consulta(
    consulta_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ambulatorio consulta by ID."""
    result = await db.execute(
        select(AmbulatorioConsulta).where(
            AmbulatorioConsulta.id == consulta_id, AmbulatorioConsulta.tenant_id == tenant_id
        )
    )
    consulta = result.scalar_one_or_none()
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Consulta não encontrada"
        )
    return consulta


@router.put("/{consulta_id}", response_model=AmbulatorioConsultaResponse, status_code=status.HTTP_200_OK)
async def update_ambulatorio_consulta(
    consulta_id: UUID,
    consulta_data: AmbulatorioConsultaUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update ambulatorio consulta."""
    result = await db.execute(
        select(AmbulatorioConsulta).where(
            AmbulatorioConsulta.id == consulta_id, AmbulatorioConsulta.tenant_id == tenant_id
        )
    )
    consulta = result.scalar_one_or_none()
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Consulta não encontrada"
        )

    update_data = consulta_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(consulta, field, value)

    await db.commit()
    await db.refresh(consulta)
    return consulta


@router.delete("/{consulta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ambulatorio_consulta(
    consulta_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete ambulatorio consulta."""
    result = await db.execute(
        select(AmbulatorioConsulta).where(
            AmbulatorioConsulta.id == consulta_id, AmbulatorioConsulta.tenant_id == tenant_id
        )
    )
    consulta = result.scalar_one_or_none()
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Consulta não encontrada"
        )

    from datetime import datetime
    consulta.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_ambulatorio_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ambulatorio KPIs."""
    # Total consultas
    result = await db.execute(
        select(func.count(AmbulatorioConsulta.id)).where(
            AmbulatorioConsulta.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Consultas hoje
    from datetime import datetime
    hoje = datetime.utcnow().strftime("%Y-%m-%d")
    result = await db.execute(
        select(func.count(AmbulatorioConsulta.id)).where(
            AmbulatorioConsulta.tenant_id == tenant_id, AmbulatorioConsulta.data == hoje
        )
    )
    hoje_count = result.scalar() or 0

    # Por status
    result = await db.execute(
        select(
            AmbulatorioConsulta.status,
            func.count(AmbulatorioConsulta.id).label("count"),
        )
        .where(AmbulatorioConsulta.tenant_id == tenant_id)
        .group_by(AmbulatorioConsulta.status)
    )
    por_status = {row.status: row.count for row in result.all()}

    return {
        "total": total,
        "hoje": hoje_count,
        "por_status": por_status,
        "taxa_no_show": 0,  # TODO: Calcular
    }
