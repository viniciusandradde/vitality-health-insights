"""Fisioterapia routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.fisioterapia import SessaoFisioterapia
from app.models.user import User
from app.schemas.assistencial.fisioterapia import (
    SessaoFisioterapiaCreate,
    SessaoFisioterapiaResponse,
    SessaoFisioterapiaUpdate,
)

router = APIRouter(prefix="/fisioterapia", tags=["Assistencial - Fisioterapia"])


@router.get("", response_model=List[SessaoFisioterapiaResponse], status_code=status.HTTP_200_OK)
async def list_sessoes_fisioterapia(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List sessões de fisioterapia."""
    result = await db.execute(
        select(SessaoFisioterapia)
        .where(SessaoFisioterapia.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    sessoes = list(result.scalars().all())
    return sessoes


@router.post("", response_model=SessaoFisioterapiaResponse, status_code=status.HTTP_201_CREATED)
async def create_sessao_fisioterapia(
    sessao_data: SessaoFisioterapiaCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create sessão de fisioterapia."""
    sessao = SessaoFisioterapia(**sessao_data.model_dump(), tenant_id=tenant_id)
    db.add(sessao)
    await db.commit()
    await db.refresh(sessao)
    return sessao


@router.get("/{sessao_id}", response_model=SessaoFisioterapiaResponse, status_code=status.HTTP_200_OK)
async def get_sessao_fisioterapia(
    sessao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get sessão de fisioterapia by ID."""
    result = await db.execute(
        select(SessaoFisioterapia).where(
            SessaoFisioterapia.id == sessao_id, SessaoFisioterapia.tenant_id == tenant_id
        )
    )
    sessao = result.scalar_one_or_none()
    if not sessao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada"
        )
    return sessao


@router.put("/{sessao_id}", response_model=SessaoFisioterapiaResponse, status_code=status.HTTP_200_OK)
async def update_sessao_fisioterapia(
    sessao_id: UUID,
    sessao_data: SessaoFisioterapiaUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update sessão de fisioterapia."""
    result = await db.execute(
        select(SessaoFisioterapia).where(
            SessaoFisioterapia.id == sessao_id, SessaoFisioterapia.tenant_id == tenant_id
        )
    )
    sessao = result.scalar_one_or_none()
    if not sessao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada"
        )

    update_data = sessao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sessao, field, value)

    await db.commit()
    await db.refresh(sessao)
    return sessao


@router.delete("/{sessao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sessao_fisioterapia(
    sessao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete sessão de fisioterapia."""
    result = await db.execute(
        select(SessaoFisioterapia).where(
            SessaoFisioterapia.id == sessao_id, SessaoFisioterapia.tenant_id == tenant_id
        )
    )
    sessao = result.scalar_one_or_none()
    if not sessao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada"
        )

    from datetime import datetime
    sessao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_fisioterapia_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get fisioterapia KPIs."""
    # Total sessões
    result = await db.execute(
        select(func.count(SessaoFisioterapia.id)).where(
            SessaoFisioterapia.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Realizadas
    result = await db.execute(
        select(func.count(SessaoFisioterapia.id)).where(
            SessaoFisioterapia.tenant_id == tenant_id, SessaoFisioterapia.status == "realizada"
        )
    )
    realizadas = result.scalar() or 0

    # Total de minutos
    result = await db.execute(
        select(func.sum(SessaoFisioterapia.duracao)).where(
            SessaoFisioterapia.tenant_id == tenant_id, SessaoFisioterapia.status == "realizada"
        )
    )
    total_minutos = result.scalar() or 0

    return {
        "total": total,
        "realizadas": realizadas,
        "taxa_realizacao": round((realizadas / total * 100) if total > 0 else 0, 2),
        "total_minutos": total_minutos or 0,
    }
