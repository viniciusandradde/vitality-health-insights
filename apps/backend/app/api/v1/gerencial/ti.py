"""TI routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.ti import ChamadoTI
from app.models.user import User
from app.schemas.gerencial.ti import (
    ChamadoTICreate,
    ChamadoTIResponse,
    ChamadoTIUpdate,
)

router = APIRouter(prefix="/ti", tags=["Gerencial - TI"])


@router.get("", response_model=List[ChamadoTIResponse], status_code=status.HTTP_200_OK)
async def list_chamados_ti(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List chamados TI."""
    result = await db.execute(
        select(ChamadoTI)
        .where(ChamadoTI.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    chamados = list(result.scalars().all())
    return chamados


@router.post("", response_model=ChamadoTIResponse, status_code=status.HTTP_201_CREATED)
async def create_chamado_ti(
    chamado_data: ChamadoTICreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create chamado TI."""
    chamado = ChamadoTI(**chamado_data.model_dump(), tenant_id=tenant_id)
    db.add(chamado)
    await db.commit()
    await db.refresh(chamado)
    return chamado


@router.get("/{chamado_id}", response_model=ChamadoTIResponse, status_code=status.HTTP_200_OK)
async def get_chamado_ti(
    chamado_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chamado TI by ID."""
    result = await db.execute(
        select(ChamadoTI).where(
            ChamadoTI.id == chamado_id, ChamadoTI.tenant_id == tenant_id
        )
    )
    chamado = result.scalar_one_or_none()
    if not chamado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chamado não encontrado"
        )
    return chamado


@router.put("/{chamado_id}", response_model=ChamadoTIResponse, status_code=status.HTTP_200_OK)
async def update_chamado_ti(
    chamado_id: UUID,
    chamado_data: ChamadoTIUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update chamado TI."""
    result = await db.execute(
        select(ChamadoTI).where(
            ChamadoTI.id == chamado_id, ChamadoTI.tenant_id == tenant_id
        )
    )
    chamado = result.scalar_one_or_none()
    if not chamado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chamado não encontrado"
        )

    update_data = chamado_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chamado, field, value)

    await db.commit()
    await db.refresh(chamado)
    return chamado


@router.delete("/{chamado_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chamado_ti(
    chamado_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete chamado TI."""
    result = await db.execute(
        select(ChamadoTI).where(
            ChamadoTI.id == chamado_id, ChamadoTI.tenant_id == tenant_id
        )
    )
    chamado = result.scalar_one_or_none()
    if not chamado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chamado não encontrado"
        )

    from datetime import datetime
    chamado.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_ti_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get TI KPIs."""
    # Total chamados
    result = await db.execute(
        select(func.count(ChamadoTI.id)).where(ChamadoTI.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Abertos
    result = await db.execute(
        select(func.count(ChamadoTI.id)).where(
            ChamadoTI.tenant_id == tenant_id, ChamadoTI.status.in_(["aberto", "em_andamento"])
        )
    )
    abertos = result.scalar() or 0

    # Resolvidos
    result = await db.execute(
        select(func.count(ChamadoTI.id)).where(
            ChamadoTI.tenant_id == tenant_id, ChamadoTI.status == "resolvido"
        )
    )
    resolvidos = result.scalar() or 0

    # Por prioridade
    result = await db.execute(
        select(
            ChamadoTI.prioridade,
            func.count(ChamadoTI.id).label("count"),
        )
        .where(ChamadoTI.tenant_id == tenant_id)
        .group_by(ChamadoTI.prioridade)
    )
    por_prioridade = {row.prioridade: row.count for row in result.all()}

    return {
        "total": total,
        "abertos": abertos,
        "resolvidos": resolvidos,
        "taxa_resolucao": round((resolvidos / total * 100) if total > 0 else 0, 2),
        "por_prioridade": por_prioridade,
    }
