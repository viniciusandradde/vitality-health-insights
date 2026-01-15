"""Internacao routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.internacao import Internacao
from app.models.user import User
from app.schemas.assistencial.internacao import (
    InternacaoCreate,
    InternacaoResponse,
    InternacaoUpdate,
)

router = APIRouter(prefix="/internacao", tags=["Assistencial - Internacao"])


@router.get("", response_model=List[InternacaoResponse], status_code=status.HTTP_200_OK)
async def list_internacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List internacoes."""
    result = await db.execute(
        select(Internacao)
        .where(Internacao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    internacoes = list(result.scalars().all())
    return internacoes


@router.post("", response_model=InternacaoResponse, status_code=status.HTTP_201_CREATED)
async def create_internacao(
    internacao_data: InternacaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create internacao."""
    internacao = Internacao(**internacao_data.model_dump(), tenant_id=tenant_id)
    db.add(internacao)
    await db.commit()
    await db.refresh(internacao)
    return internacao


@router.get("/{internacao_id}", response_model=InternacaoResponse, status_code=status.HTTP_200_OK)
async def get_internacao(
    internacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get internacao by ID."""
    result = await db.execute(
        select(Internacao).where(
            Internacao.id == internacao_id, Internacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internacao not found"
        )
    return internacao


@router.put("/{internacao_id}", response_model=InternacaoResponse, status_code=status.HTTP_200_OK)
async def update_internacao(
    internacao_id: UUID,
    internacao_data: InternacaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update internacao."""
    result = await db.execute(
        select(Internacao).where(
            Internacao.id == internacao_id, Internacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internacao not found"
        )

    update_data = internacao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(internacao, field, value)

    await db.commit()
    await db.refresh(internacao)
    return internacao


@router.delete("/{internacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_internacao(
    internacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete internacao."""
    result = await db.execute(
        select(Internacao).where(
            Internacao.id == internacao_id, Internacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internacao not found"
        )

    from datetime import datetime
    internacao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_internacao_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get internacao KPIs."""
    from sqlalchemy import func

    # Total internacoes
    result = await db.execute(
        select(func.count(Internacao.id)).where(Internacao.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Internados
    result = await db.execute(
        select(func.count(Internacao.id)).where(
            Internacao.tenant_id == tenant_id, Internacao.status == "internado"
        )
    )
    internados = result.scalar() or 0

    return {
        "total": total,
        "internados": internados,
        "altas": 0,  # TODO: Calculate
        "taxa_ocupacao": 0,  # TODO: Calculate
    }
