"""Farmácia routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.farmacia import Prescricao
from app.models.user import User
from app.schemas.assistencial.farmacia import (
    PrescricaoCreate,
    PrescricaoResponse,
    PrescricaoUpdate,
)

router = APIRouter(prefix="/farmacia", tags=["Assistencial - Farmácia"])


@router.get("", response_model=List[PrescricaoResponse], status_code=status.HTTP_200_OK)
async def list_prescricoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List prescrições."""
    result = await db.execute(
        select(Prescricao)
        .where(Prescricao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    prescricoes = list(result.scalars().all())
    return prescricoes


@router.post("", response_model=PrescricaoResponse, status_code=status.HTTP_201_CREATED)
async def create_prescricao(
    prescricao_data: PrescricaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create prescrição."""
    prescricao = Prescricao(**prescricao_data.model_dump(), tenant_id=tenant_id)
    db.add(prescricao)
    await db.commit()
    await db.refresh(prescricao)
    return prescricao


@router.get("/{prescricao_id}", response_model=PrescricaoResponse, status_code=status.HTTP_200_OK)
async def get_prescricao(
    prescricao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get prescrição by ID."""
    result = await db.execute(
        select(Prescricao).where(
            Prescricao.id == prescricao_id, Prescricao.tenant_id == tenant_id
        )
    )
    prescricao = result.scalar_one_or_none()
    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescrição não encontrada"
        )
    return prescricao


@router.put("/{prescricao_id}", response_model=PrescricaoResponse, status_code=status.HTTP_200_OK)
async def update_prescricao(
    prescricao_id: UUID,
    prescricao_data: PrescricaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update prescrição."""
    result = await db.execute(
        select(Prescricao).where(
            Prescricao.id == prescricao_id, Prescricao.tenant_id == tenant_id
        )
    )
    prescricao = result.scalar_one_or_none()
    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescrição não encontrada"
        )

    update_data = prescricao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prescricao, field, value)

    await db.commit()
    await db.refresh(prescricao)
    return prescricao


@router.delete("/{prescricao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescricao(
    prescricao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete prescrição."""
    result = await db.execute(
        select(Prescricao).where(
            Prescricao.id == prescricao_id, Prescricao.tenant_id == tenant_id
        )
    )
    prescricao = result.scalar_one_or_none()
    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescrição não encontrada"
        )

    from datetime import datetime
    prescricao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_farmacia_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get farmácia KPIs."""
    # Total prescrições
    result = await db.execute(
        select(func.count(Prescricao.id)).where(Prescricao.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Dispensadas
    result = await db.execute(
        select(func.count(Prescricao.id)).where(
            Prescricao.tenant_id == tenant_id, Prescricao.dispensado == True
        )
    )
    dispensadas = result.scalar() or 0

    # Pendentes
    result = await db.execute(
        select(func.count(Prescricao.id)).where(
            Prescricao.tenant_id == tenant_id, Prescricao.dispensado == False
        )
    )
    pendentes = result.scalar() or 0

    return {
        "total": total,
        "dispensadas": dispensadas,
        "pendentes": pendentes,
        "taxa_dispensacao": round((dispensadas / total * 100) if total > 0 else 0, 2),
    }
