"""CCIH routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.ccih import Infeccao
from app.models.user import User
from app.schemas.assistencial.ccih import (
    InfeccaoCreate,
    InfeccaoResponse,
    InfeccaoUpdate,
)

router = APIRouter(prefix="/ccih", tags=["Assistencial - CCIH"])


@router.get("", response_model=List[InfeccaoResponse], status_code=status.HTTP_200_OK)
async def list_infeccoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List infecções."""
    result = await db.execute(
        select(Infeccao)
        .where(Infeccao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    infeccoes = list(result.scalars().all())
    return infeccoes


@router.post("", response_model=InfeccaoResponse, status_code=status.HTTP_201_CREATED)
async def create_infeccao(
    infeccao_data: InfeccaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create infecção."""
    infeccao = Infeccao(**infeccao_data.model_dump(), tenant_id=tenant_id)
    db.add(infeccao)
    await db.commit()
    await db.refresh(infeccao)
    return infeccao


@router.get("/{infeccao_id}", response_model=InfeccaoResponse, status_code=status.HTTP_200_OK)
async def get_infeccao(
    infeccao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get infecção by ID."""
    result = await db.execute(
        select(Infeccao).where(
            Infeccao.id == infeccao_id, Infeccao.tenant_id == tenant_id
        )
    )
    infeccao = result.scalar_one_or_none()
    if not infeccao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Infecção não encontrada"
        )
    return infeccao


@router.put("/{infeccao_id}", response_model=InfeccaoResponse, status_code=status.HTTP_200_OK)
async def update_infeccao(
    infeccao_id: UUID,
    infeccao_data: InfeccaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update infecção."""
    result = await db.execute(
        select(Infeccao).where(
            Infeccao.id == infeccao_id, Infeccao.tenant_id == tenant_id
        )
    )
    infeccao = result.scalar_one_or_none()
    if not infeccao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Infecção não encontrada"
        )

    update_data = infeccao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(infeccao, field, value)

    await db.commit()
    await db.refresh(infeccao)
    return infeccao


@router.delete("/{infeccao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_infeccao(
    infeccao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete infecção."""
    result = await db.execute(
        select(Infeccao).where(
            Infeccao.id == infeccao_id, Infeccao.tenant_id == tenant_id
        )
    )
    infeccao = result.scalar_one_or_none()
    if not infeccao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Infecção não encontrada"
        )

    from datetime import datetime
    infeccao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_ccih_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get CCIH KPIs."""
    # Total infecções
    result = await db.execute(
        select(func.count(Infeccao.id)).where(Infeccao.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Por tipo
    result = await db.execute(
        select(
            Infeccao.tipo_infeccao,
            func.count(Infeccao.id).label("count"),
        )
        .where(Infeccao.tenant_id == tenant_id)
        .group_by(Infeccao.tipo_infeccao)
    )
    por_tipo = {row.tipo_infeccao: row.count for row in result.all()}

    # Em tratamento
    result = await db.execute(
        select(func.count(Infeccao.id)).where(
            Infeccao.tenant_id == tenant_id, Infeccao.status == "em_tratamento"
        )
    )
    em_tratamento = result.scalar() or 0

    return {
        "total": total,
        "em_tratamento": em_tratamento,
        "por_tipo": por_tipo,
        "taxa_infeccao": 0,  # TODO: Calcular baseado em internações
    }
