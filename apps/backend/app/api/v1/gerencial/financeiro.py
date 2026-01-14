"""Financeiro routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.financeiro import MovimentacaoFinanceira
from app.models.user import User
from app.schemas.gerencial.financeiro import (
    MovimentacaoFinanceiraCreate,
    MovimentacaoFinanceiraResponse,
    MovimentacaoFinanceiraUpdate,
)

router = APIRouter(prefix="/financeiro", tags=["Gerencial - Financeiro"])


@router.get("", response_model=List[MovimentacaoFinanceiraResponse], status_code=status.HTTP_200_OK)
async def list_movimentacoes_financeiras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List movimentações financeiras."""
    result = await db.execute(
        select(MovimentacaoFinanceira)
        .where(MovimentacaoFinanceira.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    movimentacoes = list(result.scalars().all())
    return movimentacoes


@router.post("", response_model=MovimentacaoFinanceiraResponse, status_code=status.HTTP_201_CREATED)
async def create_movimentacao_financeira(
    movimentacao_data: MovimentacaoFinanceiraCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create movimentação financeira."""
    movimentacao = MovimentacaoFinanceira(**movimentacao_data.model_dump(), tenant_id=tenant_id)
    db.add(movimentacao)
    await db.commit()
    await db.refresh(movimentacao)
    return movimentacao


@router.get("/{movimentacao_id}", response_model=MovimentacaoFinanceiraResponse, status_code=status.HTTP_200_OK)
async def get_movimentacao_financeira(
    movimentacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get movimentação financeira by ID."""
    result = await db.execute(
        select(MovimentacaoFinanceira).where(
            MovimentacaoFinanceira.id == movimentacao_id, MovimentacaoFinanceira.tenant_id == tenant_id
        )
    )
    movimentacao = result.scalar_one_or_none()
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movimentação não encontrada"
        )
    return movimentacao


@router.put("/{movimentacao_id}", response_model=MovimentacaoFinanceiraResponse, status_code=status.HTTP_200_OK)
async def update_movimentacao_financeira(
    movimentacao_id: UUID,
    movimentacao_data: MovimentacaoFinanceiraUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update movimentação financeira."""
    result = await db.execute(
        select(MovimentacaoFinanceira).where(
            MovimentacaoFinanceira.id == movimentacao_id, MovimentacaoFinanceira.tenant_id == tenant_id
        )
    )
    movimentacao = result.scalar_one_or_none()
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movimentação não encontrada"
        )

    update_data = movimentacao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(movimentacao, field, value)

    await db.commit()
    await db.refresh(movimentacao)
    return movimentacao


@router.delete("/{movimentacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movimentacao_financeira(
    movimentacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete movimentação financeira."""
    result = await db.execute(
        select(MovimentacaoFinanceira).where(
            MovimentacaoFinanceira.id == movimentacao_id, MovimentacaoFinanceira.tenant_id == tenant_id
        )
    )
    movimentacao = result.scalar_one_or_none()
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movimentação não encontrada"
        )

    from datetime import datetime
    movimentacao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_financeiro_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get financeiro KPIs."""
    # Total receitas
    result = await db.execute(
        select(func.sum(MovimentacaoFinanceira.valor)).where(
            MovimentacaoFinanceira.tenant_id == tenant_id,
            MovimentacaoFinanceira.tipo == "receita",
            MovimentacaoFinanceira.status == "pago",
        )
    )
    total_receitas = result.scalar() or 0

    # Total despesas
    result = await db.execute(
        select(func.sum(MovimentacaoFinanceira.valor)).where(
            MovimentacaoFinanceira.tenant_id == tenant_id,
            MovimentacaoFinanceira.tipo == "despesa",
            MovimentacaoFinanceira.status == "pago",
        )
    )
    total_despesas = result.scalar() or 0

    # Saldo
    saldo = total_receitas - total_despesas

    return {
        "total_receitas": float(total_receitas),
        "total_despesas": float(total_despesas),
        "saldo": float(saldo),
        "margem": round((saldo / total_receitas * 100) if total_receitas > 0 else 0, 2),
    }
