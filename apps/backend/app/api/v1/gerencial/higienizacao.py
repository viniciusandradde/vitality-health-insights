"""Higienização routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.higienizacao import ServicoHigienizacao
from app.models.user import User
from app.schemas.gerencial.higienizacao import (
    ServicoHigienizacaoCreate,
    ServicoHigienizacaoResponse,
    ServicoHigienizacaoUpdate,
)

router = APIRouter(prefix="/higienizacao", tags=["Gerencial - Higienização"])


@router.get("", response_model=List[ServicoHigienizacaoResponse], status_code=status.HTTP_200_OK)
async def list_servicos_higienizacao(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List serviços de higienização."""
    result = await db.execute(
        select(ServicoHigienizacao)
        .where(ServicoHigienizacao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    servicos = list(result.scalars().all())
    return servicos


@router.post("", response_model=ServicoHigienizacaoResponse, status_code=status.HTTP_201_CREATED)
async def create_servico_higienizacao(
    servico_data: ServicoHigienizacaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create serviço de higienização."""
    servico = ServicoHigienizacao(**servico_data.model_dump(), tenant_id=tenant_id)
    db.add(servico)
    await db.commit()
    await db.refresh(servico)
    return servico


@router.get("/{servico_id}", response_model=ServicoHigienizacaoResponse, status_code=status.HTTP_200_OK)
async def get_servico_higienizacao(
    servico_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get serviço de higienização by ID."""
    result = await db.execute(
        select(ServicoHigienizacao).where(
            ServicoHigienizacao.id == servico_id, ServicoHigienizacao.tenant_id == tenant_id
        )
    )
    servico = result.scalar_one_or_none()
    if not servico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado"
        )
    return servico


@router.put("/{servico_id}", response_model=ServicoHigienizacaoResponse, status_code=status.HTTP_200_OK)
async def update_servico_higienizacao(
    servico_id: UUID,
    servico_data: ServicoHigienizacaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update serviço de higienização."""
    result = await db.execute(
        select(ServicoHigienizacao).where(
            ServicoHigienizacao.id == servico_id, ServicoHigienizacao.tenant_id == tenant_id
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
async def delete_servico_higienizacao(
    servico_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete serviço de higienização."""
    result = await db.execute(
        select(ServicoHigienizacao).where(
            ServicoHigienizacao.id == servico_id, ServicoHigienizacao.tenant_id == tenant_id
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
async def get_higienizacao_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get higienização KPIs."""
    # Total serviços
    result = await db.execute(
        select(func.count(ServicoHigienizacao.id)).where(
            ServicoHigienizacao.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Concluídos
    result = await db.execute(
        select(func.count(ServicoHigienizacao.id)).where(
            ServicoHigienizacao.tenant_id == tenant_id, ServicoHigienizacao.status == "concluido"
        )
    )
    concluidos = result.scalar() or 0

    # Por tipo
    result = await db.execute(
        select(
            ServicoHigienizacao.tipo_servico,
            func.count(ServicoHigienizacao.id).label("count"),
        )
        .where(ServicoHigienizacao.tenant_id == tenant_id)
        .group_by(ServicoHigienizacao.tipo_servico)
    )
    por_tipo = {row.tipo_servico: row.count for row in result.all()}

    return {
        "total": total,
        "concluidos": concluidos,
        "taxa_conclusao": round((concluidos / total * 100) if total > 0 else 0, 2),
        "por_tipo": por_tipo,
    }
