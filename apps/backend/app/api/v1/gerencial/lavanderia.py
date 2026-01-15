"""Lavanderia routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.lavanderia import ServicoLavanderia
from app.models.user import User
from app.schemas.gerencial.lavanderia import (
    ServicoLavanderiaCreate,
    ServicoLavanderiaResponse,
    ServicoLavanderiaUpdate,
)

router = APIRouter(prefix="/lavanderia", tags=["Gerencial - Lavanderia"])


@router.get("", response_model=List[ServicoLavanderiaResponse], status_code=status.HTTP_200_OK)
async def list_servicos_lavanderia(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List serviços de lavanderia."""
    result = await db.execute(
        select(ServicoLavanderia)
        .where(ServicoLavanderia.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    servicos = list(result.scalars().all())
    return servicos


@router.post("", response_model=ServicoLavanderiaResponse, status_code=status.HTTP_201_CREATED)
async def create_servico_lavanderia(
    servico_data: ServicoLavanderiaCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create serviço de lavanderia."""
    servico = ServicoLavanderia(**servico_data.model_dump(), tenant_id=tenant_id)
    db.add(servico)
    await db.commit()
    await db.refresh(servico)
    return servico


@router.get("/{servico_id}", response_model=ServicoLavanderiaResponse, status_code=status.HTTP_200_OK)
async def get_servico_lavanderia(
    servico_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get serviço de lavanderia by ID."""
    result = await db.execute(
        select(ServicoLavanderia).where(
            ServicoLavanderia.id == servico_id, ServicoLavanderia.tenant_id == tenant_id
        )
    )
    servico = result.scalar_one_or_none()
    if not servico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado"
        )
    return servico


@router.put("/{servico_id}", response_model=ServicoLavanderiaResponse, status_code=status.HTTP_200_OK)
async def update_servico_lavanderia(
    servico_id: UUID,
    servico_data: ServicoLavanderiaUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update serviço de lavanderia."""
    result = await db.execute(
        select(ServicoLavanderia).where(
            ServicoLavanderia.id == servico_id, ServicoLavanderia.tenant_id == tenant_id
        )
    )
    servico = result.scalar_one_or_none()
    if not servico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado"
        )

    update_data = servico_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(servico, field, value)

    await db.commit()
    await db.refresh(servico)
    return servico


@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_servico_lavanderia(
    servico_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete serviço de lavanderia."""
    result = await db.execute(
        select(ServicoLavanderia).where(
            ServicoLavanderia.id == servico_id, ServicoLavanderia.tenant_id == tenant_id
        )
    )
    servico = result.scalar_one_or_none()
    if not servico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado"
        )

    from datetime import datetime
    servico.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_lavanderia_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get lavanderia KPIs."""
    # Total serviços
    result = await db.execute(
        select(func.count(ServicoLavanderia.id)).where(
            ServicoLavanderia.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Total quantidade de peças
    result = await db.execute(
        select(func.sum(ServicoLavanderia.quantidade)).where(
            ServicoLavanderia.tenant_id == tenant_id
        )
    )
    total_pecas = result.scalar() or 0

    # Entregues
    result = await db.execute(
        select(func.count(ServicoLavanderia.id)).where(
            ServicoLavanderia.tenant_id == tenant_id, ServicoLavanderia.status == "entregue"
        )
    )
    entregues = result.scalar() or 0

    return {
        "total": total,
        "total_pecas": total_pecas or 0,
        "entregues": entregues,
        "taxa_entrega": round((entregues / total * 100) if total > 0 else 0, 2),
    }
