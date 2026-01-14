"""SPP routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.spp import AtividadeSPP
from app.models.user import User
from app.schemas.gerencial.spp import (
    AtividadeSPPCreate,
    AtividadeSPPResponse,
    AtividadeSPPUpdate,
)

router = APIRouter(prefix="/spp", tags=["Gerencial - SPP"])


@router.get("", response_model=List[AtividadeSPPResponse], status_code=status.HTTP_200_OK)
async def list_atividades_spp(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List atividades SPP."""
    result = await db.execute(
        select(AtividadeSPP)
        .where(AtividadeSPP.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    atividades = list(result.scalars().all())
    return atividades


@router.post("", response_model=AtividadeSPPResponse, status_code=status.HTTP_201_CREATED)
async def create_atividade_spp(
    atividade_data: AtividadeSPPCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create atividade SPP."""
    atividade = AtividadeSPP(**atividade_data.model_dump(), tenant_id=tenant_id)
    db.add(atividade)
    await db.commit()
    await db.refresh(atividade)
    return atividade


@router.get("/{atividade_id}", response_model=AtividadeSPPResponse, status_code=status.HTTP_200_OK)
async def get_atividade_spp(
    atividade_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get atividade SPP by ID."""
    result = await db.execute(
        select(AtividadeSPP).where(
            AtividadeSPP.id == atividade_id, AtividadeSPP.tenant_id == tenant_id
        )
    )
    atividade = result.scalar_one_or_none()
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atividade não encontrada"
        )
    return atividade


@router.put("/{atividade_id}", response_model=AtividadeSPPResponse, status_code=status.HTTP_200_OK)
async def update_atividade_spp(
    atividade_id: UUID,
    atividade_data: AtividadeSPPUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update atividade SPP."""
    result = await db.execute(
        select(AtividadeSPP).where(
            AtividadeSPP.id == atividade_id, AtividadeSPP.tenant_id == tenant_id
        )
    )
    atividade = result.scalar_one_or_none()
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atividade não encontrada"
        )

    update_data = atividade_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(atividade, field, value)

    await db.commit()
    await db.refresh(atividade)
    return atividade


@router.delete("/{atividade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_atividade_spp(
    atividade_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete atividade SPP."""
    result = await db.execute(
        select(AtividadeSPP).where(
            AtividadeSPP.id == atividade_id, AtividadeSPP.tenant_id == tenant_id
        )
    )
    atividade = result.scalar_one_or_none()
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atividade não encontrada"
        )

    from datetime import datetime
    atividade.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_spp_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SPP KPIs."""
    # Total atividades
    result = await db.execute(
        select(func.count(AtividadeSPP.id)).where(AtividadeSPP.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Concluídas
    result = await db.execute(
        select(func.count(AtividadeSPP.id)).where(
            AtividadeSPP.tenant_id == tenant_id, AtividadeSPP.status == "concluido"
        )
    )
    concluidas = result.scalar() or 0

    # Por tipo
    result = await db.execute(
        select(
            AtividadeSPP.tipo_atividade,
            func.count(AtividadeSPP.id).label("count"),
        )
        .where(AtividadeSPP.tenant_id == tenant_id)
        .group_by(AtividadeSPP.tipo_atividade)
    )
    por_tipo = {row.tipo_atividade: row.count for row in result.all()}

    return {
        "total": total,
        "concluidas": concluidas,
        "taxa_conclusao": round((concluidas / total * 100) if total > 0 else 0, 2),
        "por_tipo": por_tipo,
    }
