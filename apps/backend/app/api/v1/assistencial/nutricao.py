"""Nutrição routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.nutricao import AvaliacaoNutricional
from app.models.user import User
from app.schemas.assistencial.nutricao import (
    AvaliacaoNutricionalCreate,
    AvaliacaoNutricionalResponse,
    AvaliacaoNutricionalUpdate,
)

router = APIRouter(prefix="/nutricao", tags=["Assistencial - Nutrição"])


@router.get("", response_model=List[AvaliacaoNutricionalResponse], status_code=status.HTTP_200_OK)
async def list_avaliacoes_nutricionais(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List avaliações nutricionais."""
    result = await db.execute(
        select(AvaliacaoNutricional)
        .where(AvaliacaoNutricional.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    avaliacoes = list(result.scalars().all())
    return avaliacoes


@router.post("", response_model=AvaliacaoNutricionalResponse, status_code=status.HTTP_201_CREATED)
async def create_avaliacao_nutricional(
    avaliacao_data: AvaliacaoNutricionalCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create avaliação nutricional."""
    avaliacao = AvaliacaoNutricional(**avaliacao_data.model_dump(), tenant_id=tenant_id)
    db.add(avaliacao)
    await db.commit()
    await db.refresh(avaliacao)
    return avaliacao


@router.get("/{avaliacao_id}", response_model=AvaliacaoNutricionalResponse, status_code=status.HTTP_200_OK)
async def get_avaliacao_nutricional(
    avaliacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get avaliação nutricional by ID."""
    result = await db.execute(
        select(AvaliacaoNutricional).where(
            AvaliacaoNutricional.id == avaliacao_id, AvaliacaoNutricional.tenant_id == tenant_id
        )
    )
    avaliacao = result.scalar_one_or_none()
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada"
        )
    return avaliacao


@router.put("/{avaliacao_id}", response_model=AvaliacaoNutricionalResponse, status_code=status.HTTP_200_OK)
async def update_avaliacao_nutricional(
    avaliacao_id: UUID,
    avaliacao_data: AvaliacaoNutricionalUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update avaliação nutricional."""
    result = await db.execute(
        select(AvaliacaoNutricional).where(
            AvaliacaoNutricional.id == avaliacao_id, AvaliacaoNutricional.tenant_id == tenant_id
        )
    )
    avaliacao = result.scalar_one_or_none()
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada"
        )

    update_data = avaliacao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(avaliacao, field, value)

    await db.commit()
    await db.refresh(avaliacao)
    return avaliacao


@router.delete("/{avaliacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avaliacao_nutricional(
    avaliacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete avaliação nutricional."""
    result = await db.execute(
        select(AvaliacaoNutricional).where(
            AvaliacaoNutricional.id == avaliacao_id, AvaliacaoNutricional.tenant_id == tenant_id
        )
    )
    avaliacao = result.scalar_one_or_none()
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Avaliação não encontrada"
        )

    from datetime import datetime
    avaliacao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_nutricao_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get nutrição KPIs."""
    # Total avaliações
    result = await db.execute(
        select(func.count(AvaliacaoNutricional.id)).where(
            AvaliacaoNutricional.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Por diagnóstico
    result = await db.execute(
        select(
            AvaliacaoNutricional.diagnostico,
            func.count(AvaliacaoNutricional.id).label("count"),
        )
        .where(AvaliacaoNutricional.tenant_id == tenant_id)
        .group_by(AvaliacaoNutricional.diagnostico)
    )
    por_diagnostico = {row.diagnostico or "sem_diagnostico": row.count for row in result.all()}

    # Média IMC
    result = await db.execute(
        select(func.avg(AvaliacaoNutricional.imc)).where(
            AvaliacaoNutricional.tenant_id == tenant_id, AvaliacaoNutricional.imc.isnot(None)
        )
    )
    media_imc = result.scalar() or 0

    return {
        "total": total,
        "por_diagnostico": por_diagnostico,
        "media_imc": round(float(media_imc), 2) if media_imc else 0,
    }
