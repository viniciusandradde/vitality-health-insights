"""Agendas routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.agendas import Agendamento
from app.models.user import User
from app.schemas.assistencial.agendas import (
    AgendamentoCreate,
    AgendamentoResponse,
    AgendamentoUpdate,
)

router = APIRouter(prefix="/agendas", tags=["Assistencial - Agendas"])


@router.get("", response_model=List[AgendamentoResponse], status_code=status.HTTP_200_OK)
async def list_agendamentos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List agendamentos."""
    result = await db.execute(
        select(Agendamento)
        .where(Agendamento.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    agendamentos = list(result.scalars().all())
    return agendamentos


@router.post("", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
async def create_agendamento(
    agendamento_data: AgendamentoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create agendamento."""
    agendamento = Agendamento(**agendamento_data.model_dump(), tenant_id=tenant_id)
    db.add(agendamento)
    await db.commit()
    await db.refresh(agendamento)
    return agendamento


@router.get("/{agendamento_id}", response_model=AgendamentoResponse, status_code=status.HTTP_200_OK)
async def get_agendamento(
    agendamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get agendamento by ID."""
    result = await db.execute(
        select(Agendamento).where(
            Agendamento.id == agendamento_id, Agendamento.tenant_id == tenant_id
        )
    )
    agendamento = result.scalar_one_or_none()
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado"
        )
    return agendamento


@router.put("/{agendamento_id}", response_model=AgendamentoResponse, status_code=status.HTTP_200_OK)
async def update_agendamento(
    agendamento_id: UUID,
    agendamento_data: AgendamentoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update agendamento."""
    result = await db.execute(
        select(Agendamento).where(
            Agendamento.id == agendamento_id, Agendamento.tenant_id == tenant_id
        )
    )
    agendamento = result.scalar_one_or_none()
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado"
        )

    update_data = agendamento_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agendamento, field, value)

    await db.commit()
    await db.refresh(agendamento)
    return agendamento


@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agendamento(
    agendamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete agendamento."""
    result = await db.execute(
        select(Agendamento).where(
            Agendamento.id == agendamento_id, Agendamento.tenant_id == tenant_id
        )
    )
    agendamento = result.scalar_one_or_none()
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado"
        )

    from datetime import datetime
    agendamento.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_agendas_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get agendas KPIs."""
    # Total agendamentos
    result = await db.execute(
        select(func.count(Agendamento.id)).where(Agendamento.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Agendamentos hoje
    from datetime import datetime
    hoje = datetime.utcnow().strftime("%Y-%m-%d")
    result = await db.execute(
        select(func.count(Agendamento.id)).where(
            Agendamento.tenant_id == tenant_id, Agendamento.data == hoje
        )
    )
    hoje_count = result.scalar() or 0

    # No-show
    result = await db.execute(
        select(func.count(Agendamento.id)).where(
            Agendamento.tenant_id == tenant_id, Agendamento.status == "no_show"
        )
    )
    no_show_count = result.scalar() or 0
    taxa_no_show = (no_show_count / total * 100) if total > 0 else 0

    return {
        "total": total,
        "hoje": hoje_count,
        "no_show": no_show_count,
        "taxa_no_show": round(taxa_no_show, 2),
    }
