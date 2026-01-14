"""Atendimentos routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.atendimentos import Atendimento
from app.models.user import User
from app.schemas.assistencial.atendimentos import (
    AtendimentoCreate,
    AtendimentoResponse,
    AtendimentoUpdate,
)

router = APIRouter(prefix="/atendimentos", tags=["Assistencial - Atendimentos"])


@router.get("", response_model=List[AtendimentoResponse], status_code=status.HTTP_200_OK)
async def list_atendimentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List atendimentos."""
    result = await db.execute(
        select(Atendimento)
        .where(Atendimento.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    atendimentos = list(result.scalars().all())
    return atendimentos


@router.post("", response_model=AtendimentoResponse, status_code=status.HTTP_201_CREATED)
async def create_atendimento(
    atendimento_data: AtendimentoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create atendimento."""
    atendimento = Atendimento(**atendimento_data.model_dump(), tenant_id=tenant_id)
    db.add(atendimento)
    await db.commit()
    await db.refresh(atendimento)
    return atendimento


@router.get("/{atendimento_id}", response_model=AtendimentoResponse, status_code=status.HTTP_200_OK)
async def get_atendimento(
    atendimento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get atendimento by ID."""
    result = await db.execute(
        select(Atendimento).where(
            Atendimento.id == atendimento_id, Atendimento.tenant_id == tenant_id
        )
    )
    atendimento = result.scalar_one_or_none()
    if not atendimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atendimento not found"
        )
    return atendimento


@router.put("/{atendimento_id}", response_model=AtendimentoResponse, status_code=status.HTTP_200_OK)
async def update_atendimento(
    atendimento_id: UUID,
    atendimento_data: AtendimentoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update atendimento."""
    result = await db.execute(
        select(Atendimento).where(
            Atendimento.id == atendimento_id, Atendimento.tenant_id == tenant_id
        )
    )
    atendimento = result.scalar_one_or_none()
    if not atendimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atendimento not found"
        )

    update_data = atendimento_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(atendimento, field, value)

    await db.commit()
    await db.refresh(atendimento)
    return atendimento


@router.delete("/{atendimento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_atendimento(
    atendimento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete atendimento."""
    result = await db.execute(
        select(Atendimento).where(
            Atendimento.id == atendimento_id, Atendimento.tenant_id == tenant_id
        )
    )
    atendimento = result.scalar_one_or_none()
    if not atendimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Atendimento not found"
        )

    from datetime import datetime
    atendimento.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_atendimentos_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get atendimentos KPIs."""
    from sqlalchemy import func

    # Total atendimentos
    result = await db.execute(
        select(func.count(Atendimento.id)).where(Atendimento.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Atendimentos hoje
    from datetime import datetime
    hoje = datetime.utcnow().strftime("%Y-%m-%d")
    result = await db.execute(
        select(func.count(Atendimento.id)).where(
            Atendimento.tenant_id == tenant_id, Atendimento.data == hoje
        )
    )
    hoje_count = result.scalar() or 0

    return {
        "total": total,
        "hoje": hoje_count,
        "em_atendimento": 0,  # TODO: Calculate
        "aguardando": 0,  # TODO: Calculate
    }
