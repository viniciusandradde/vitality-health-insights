"""Nutrição gerencial routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.nutricao_gerencial import RefeicaoGerencial
from app.models.user import User
from app.schemas.gerencial.nutricao_gerencial import (
    RefeicaoGerencialCreate,
    RefeicaoGerencialResponse,
    RefeicaoGerencialUpdate,
)

router = APIRouter(prefix="/nutricao", tags=["Gerencial - Nutrição"])


@router.get("", response_model=List[RefeicaoGerencialResponse], status_code=status.HTTP_200_OK)
async def list_refeicoes_gerenciais(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List refeições gerenciais."""
    result = await db.execute(
        select(RefeicaoGerencial)
        .where(RefeicaoGerencial.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    refeicoes = list(result.scalars().all())
    return refeicoes


@router.post("", response_model=RefeicaoGerencialResponse, status_code=status.HTTP_201_CREATED)
async def create_refeicao_gerencial(
    refeicao_data: RefeicaoGerencialCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create refeição gerencial."""
    refeicao = RefeicaoGerencial(**refeicao_data.model_dump(), tenant_id=tenant_id)
    db.add(refeicao)
    await db.commit()
    await db.refresh(refeicao)
    return refeicao


@router.get("/{refeicao_id}", response_model=RefeicaoGerencialResponse, status_code=status.HTTP_200_OK)
async def get_refeicao_gerencial(
    refeicao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get refeição gerencial by ID."""
    result = await db.execute(
        select(RefeicaoGerencial).where(
            RefeicaoGerencial.id == refeicao_id, RefeicaoGerencial.tenant_id == tenant_id
        )
    )
    refeicao = result.scalar_one_or_none()
    if not refeicao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada"
        )
    return refeicao


@router.put("/{refeicao_id}", response_model=RefeicaoGerencialResponse, status_code=status.HTTP_200_OK)
async def update_refeicao_gerencial(
    refeicao_id: UUID,
    refeicao_data: RefeicaoGerencialUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update refeição gerencial."""
    result = await db.execute(
        select(RefeicaoGerencial).where(
            RefeicaoGerencial.id == refeicao_id, RefeicaoGerencial.tenant_id == tenant_id
        )
    )
    refeicao = result.scalar_one_or_none()
    if not refeicao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada"
        )

    update_data = refeicao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(refeicao, field, value)

    await db.commit()
    await db.refresh(refeicao)
    return refeicao


@router.delete("/{refeicao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_refeicao_gerencial(
    refeicao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete refeição gerencial."""
    result = await db.execute(
        select(RefeicaoGerencial).where(
            RefeicaoGerencial.id == refeicao_id, RefeicaoGerencial.tenant_id == tenant_id
        )
    )
    refeicao = result.scalar_one_or_none()
    if not refeicao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Refeição não encontrada"
        )

    from datetime import datetime
    refeicao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_nutricao_gerencial_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get nutrição gerencial KPIs."""
    # Total refeições
    result = await db.execute(
        select(func.count(RefeicaoGerencial.id)).where(
            RefeicaoGerencial.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Total quantidade de refeições servidas
    result = await db.execute(
        select(func.sum(RefeicaoGerencial.quantidade_refeicoes)).where(
            RefeicaoGerencial.tenant_id == tenant_id, RefeicaoGerencial.status == "servido"
        )
    )
    total_servidas = result.scalar() or 0

    # Valor total
    result = await db.execute(
        select(
            func.sum(
                RefeicaoGerencial.quantidade_refeicoes * RefeicaoGerencial.valor_unitario
            )
        ).where(
            RefeicaoGerencial.tenant_id == tenant_id,
            RefeicaoGerencial.valor_unitario.isnot(None),
        )
    )
    valor_total = result.scalar() or 0

    return {
        "total": total,
        "total_servidas": total_servidas or 0,
        "valor_total": float(valor_total) if valor_total else 0,
    }
