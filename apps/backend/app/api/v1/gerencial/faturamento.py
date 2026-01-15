"""Faturamento routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.faturamento import Faturamento
from app.models.user import User
from app.schemas.gerencial.faturamento import (
    FaturamentoCreate,
    FaturamentoResponse,
    FaturamentoUpdate,
)

router = APIRouter(prefix="/faturamento", tags=["Gerencial - Faturamento"])


@router.get("", response_model=List[FaturamentoResponse], status_code=status.HTTP_200_OK)
async def list_faturamentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List faturamentos."""
    result = await db.execute(
        select(Faturamento)
        .where(Faturamento.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    faturamentos = list(result.scalars().all())
    return faturamentos


@router.post("", response_model=FaturamentoResponse, status_code=status.HTTP_201_CREATED)
async def create_faturamento(
    faturamento_data: FaturamentoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create faturamento."""
    faturamento = Faturamento(**faturamento_data.model_dump(), tenant_id=tenant_id)
    db.add(faturamento)
    await db.commit()
    await db.refresh(faturamento)
    return faturamento


@router.get("/{faturamento_id}", response_model=FaturamentoResponse, status_code=status.HTTP_200_OK)
async def get_faturamento(
    faturamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get faturamento by ID."""
    result = await db.execute(
        select(Faturamento).where(
            Faturamento.id == faturamento_id, Faturamento.tenant_id == tenant_id
        )
    )
    faturamento = result.scalar_one_or_none()
    if not faturamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Faturamento não encontrado"
        )
    return faturamento


@router.put("/{faturamento_id}", response_model=FaturamentoResponse, status_code=status.HTTP_200_OK)
async def update_faturamento(
    faturamento_id: UUID,
    faturamento_data: FaturamentoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update faturamento."""
    result = await db.execute(
        select(Faturamento).where(
            Faturamento.id == faturamento_id, Faturamento.tenant_id == tenant_id
        )
    )
    faturamento = result.scalar_one_or_none()
    if not faturamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Faturamento não encontrado"
        )

    update_data = faturamento_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faturamento, field, value)

    await db.commit()
    await db.refresh(faturamento)
    return faturamento


@router.delete("/{faturamento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faturamento(
    faturamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete faturamento."""
    result = await db.execute(
        select(Faturamento).where(
            Faturamento.id == faturamento_id, Faturamento.tenant_id == tenant_id
        )
    )
    faturamento = result.scalar_one_or_none()
    if not faturamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Faturamento não encontrado"
        )

    from datetime import datetime
    faturamento.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_faturamento_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get faturamento KPIs."""
    # Total faturado
    result = await db.execute(
        select(func.sum(Faturamento.valor_total)).where(
            Faturamento.tenant_id == tenant_id, Faturamento.status != "cancelado"
        )
    )
    total_faturado = result.scalar() or 0

    # Total glosado
    result = await db.execute(
        select(func.sum(Faturamento.valor_glosado)).where(
            Faturamento.tenant_id == tenant_id
        )
    )
    total_glosado = result.scalar() or 0

    # Total recebido
    result = await db.execute(
        select(func.sum(Faturamento.valor_recebido)).where(
            Faturamento.tenant_id == tenant_id
        )
    )
    total_recebido = result.scalar() or 0

    # Taxa de glosas
    taxa_glosas = (
        (total_glosado / total_faturado * 100) if total_faturado > 0 else 0
    )

    # Taxa de recebimento
    taxa_recebimento = (
        (total_recebido / total_faturado * 100) if total_faturado > 0 else 0
    )

    return {
        "total_faturado": float(total_faturado),
        "total_glosado": float(total_glosado),
        "total_recebido": float(total_recebido),
        "taxa_glosas": round(taxa_glosas, 2),
        "taxa_recebimento": round(taxa_recebimento, 2),
    }
