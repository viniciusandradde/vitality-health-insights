"""Exames de imagem routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.exames_imagem import ExameImagem
from app.models.user import User
from app.schemas.assistencial.exames_imagem import (
    ExameImagemCreate,
    ExameImagemResponse,
    ExameImagemUpdate,
)

router = APIRouter(prefix="/exames-imagem", tags=["Assistencial - Exames de Imagem"])


@router.get("", response_model=List[ExameImagemResponse], status_code=status.HTTP_200_OK)
async def list_exames_imagem(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List exames de imagem."""
    result = await db.execute(
        select(ExameImagem)
        .where(ExameImagem.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    exames = list(result.scalars().all())
    return exames


@router.post("", response_model=ExameImagemResponse, status_code=status.HTTP_201_CREATED)
async def create_exame_imagem(
    exame_data: ExameImagemCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create exame de imagem."""
    exame = ExameImagem(**exame_data.model_dump(), tenant_id=tenant_id)
    db.add(exame)
    await db.commit()
    await db.refresh(exame)
    return exame


@router.get("/{exame_id}", response_model=ExameImagemResponse, status_code=status.HTTP_200_OK)
async def get_exame_imagem(
    exame_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get exame de imagem by ID."""
    result = await db.execute(
        select(ExameImagem).where(
            ExameImagem.id == exame_id, ExameImagem.tenant_id == tenant_id
        )
    )
    exame = result.scalar_one_or_none()
    if not exame:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exame não encontrado"
        )
    return exame


@router.put("/{exame_id}", response_model=ExameImagemResponse, status_code=status.HTTP_200_OK)
async def update_exame_imagem(
    exame_id: UUID,
    exame_data: ExameImagemUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update exame de imagem."""
    result = await db.execute(
        select(ExameImagem).where(
            ExameImagem.id == exame_id, ExameImagem.tenant_id == tenant_id
        )
    )
    exame = result.scalar_one_or_none()
    if not exame:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exame não encontrado"
        )

    update_data = exame_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exame, field, value)

    await db.commit()
    await db.refresh(exame)
    return exame


@router.delete("/{exame_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exame_imagem(
    exame_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete exame de imagem."""
    result = await db.execute(
        select(ExameImagem).where(
            ExameImagem.id == exame_id, ExameImagem.tenant_id == tenant_id
        )
    )
    exame = result.scalar_one_or_none()
    if not exame:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exame não encontrado"
        )

    from datetime import datetime
    exame.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_exames_imagem_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get exames de imagem KPIs."""
    # Total exames
    result = await db.execute(
        select(func.count(ExameImagem.id)).where(ExameImagem.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Pendentes (sem laudo)
    result = await db.execute(
        select(func.count(ExameImagem.id)).where(
            ExameImagem.tenant_id == tenant_id,
            ExameImagem.status.in_(["solicitado", "agendado", "realizado"]),
        )
    )
    pendentes = result.scalar() or 0

    # Com laudo liberado
    result = await db.execute(
        select(func.count(ExameImagem.id)).where(
            ExameImagem.tenant_id == tenant_id, ExameImagem.status == "laudo_liberado"
        )
    )
    laudados = result.scalar() or 0

    return {
        "total": total,
        "pendentes": pendentes,
        "laudados": laudados,
        "taxa_laudo": round((laudados / total * 100) if total > 0 else 0, 2),
    }
