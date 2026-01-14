"""Agência transfusional routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.transfusional import Transfusao
from app.models.user import User
from app.schemas.assistencial.transfusional import (
    TransfusaoCreate,
    TransfusaoResponse,
    TransfusaoUpdate,
)

router = APIRouter(prefix="/transfusional", tags=["Assistencial - Agência Transfusional"])


@router.get("", response_model=List[TransfusaoResponse], status_code=status.HTTP_200_OK)
async def list_transfusoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List transfusões."""
    result = await db.execute(
        select(Transfusao)
        .where(Transfusao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    transfusoes = list(result.scalars().all())
    return transfusoes


@router.post("", response_model=TransfusaoResponse, status_code=status.HTTP_201_CREATED)
async def create_transfusao(
    transfusao_data: TransfusaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create transfusão."""
    transfusao = Transfusao(**transfusao_data.model_dump(), tenant_id=tenant_id)
    db.add(transfusao)
    await db.commit()
    await db.refresh(transfusao)
    return transfusao


@router.get("/{transfusao_id}", response_model=TransfusaoResponse, status_code=status.HTTP_200_OK)
async def get_transfusao(
    transfusao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get transfusão by ID."""
    result = await db.execute(
        select(Transfusao).where(
            Transfusao.id == transfusao_id, Transfusao.tenant_id == tenant_id
        )
    )
    transfusao = result.scalar_one_or_none()
    if not transfusao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transfusão não encontrada"
        )
    return transfusao


@router.put("/{transfusao_id}", response_model=TransfusaoResponse, status_code=status.HTTP_200_OK)
async def update_transfusao(
    transfusao_id: UUID,
    transfusao_data: TransfusaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update transfusão."""
    result = await db.execute(
        select(Transfusao).where(
            Transfusao.id == transfusao_id, Transfusao.tenant_id == tenant_id
        )
    )
    transfusao = result.scalar_one_or_none()
    if not transfusao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transfusão não encontrada"
        )

    update_data = transfusao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transfusao, field, value)

    await db.commit()
    await db.refresh(transfusao)
    return transfusao


@router.delete("/{transfusao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transfusao(
    transfusao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete transfusão."""
    result = await db.execute(
        select(Transfusao).where(
            Transfusao.id == transfusao_id, Transfusao.tenant_id == tenant_id
        )
    )
    transfusao = result.scalar_one_or_none()
    if not transfusao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transfusão não encontrada"
        )

    from datetime import datetime
    transfusao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_transfusional_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get transfusional KPIs."""
    # Total transfusões
    result = await db.execute(
        select(func.count(Transfusao.id)).where(Transfusao.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Com reação
    result = await db.execute(
        select(func.count(Transfusao.id)).where(
            Transfusao.tenant_id == tenant_id,
            Transfusao.reacao.isnot(None),
            Transfusao.reacao != "nenhuma",
        )
    )
    com_reacao = result.scalar() or 0

    # Total de ml transfundidos
    result = await db.execute(
        select(func.sum(Transfusao.quantidade)).where(
            Transfusao.tenant_id == tenant_id, Transfusao.status == "concluido"
        )
    )
    total_ml = result.scalar() or 0

    return {
        "total": total,
        "com_reacao": com_reacao,
        "taxa_reacao": round((com_reacao / total * 100) if total > 0 else 0, 2),
        "total_ml": total_ml or 0,
    }
