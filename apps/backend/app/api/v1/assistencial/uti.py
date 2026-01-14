"""UTI routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.uti import UTIInternacao
from app.models.user import User
from app.schemas.assistencial.uti import (
    UTIInternacaoCreate,
    UTIInternacaoResponse,
    UTIInternacaoUpdate,
)

router = APIRouter(prefix="/uti", tags=["Assistencial - UTI"])


@router.get("", response_model=List[UTIInternacaoResponse], status_code=status.HTTP_200_OK)
async def list_uti_internacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List internações em UTI."""
    result = await db.execute(
        select(UTIInternacao)
        .where(UTIInternacao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    internacoes = list(result.scalars().all())
    return internacoes


@router.post("", response_model=UTIInternacaoResponse, status_code=status.HTTP_201_CREATED)
async def create_uti_internacao(
    internacao_data: UTIInternacaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create internação em UTI."""
    internacao = UTIInternacao(**internacao_data.model_dump(), tenant_id=tenant_id)
    db.add(internacao)
    await db.commit()
    await db.refresh(internacao)
    return internacao


@router.get("/{internacao_id}", response_model=UTIInternacaoResponse, status_code=status.HTTP_200_OK)
async def get_uti_internacao(
    internacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get internação em UTI by ID."""
    result = await db.execute(
        select(UTIInternacao).where(
            UTIInternacao.id == internacao_id, UTIInternacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internação não encontrada"
        )
    return internacao


@router.put("/{internacao_id}", response_model=UTIInternacaoResponse, status_code=status.HTTP_200_OK)
async def update_uti_internacao(
    internacao_id: UUID,
    internacao_data: UTIInternacaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update internação em UTI."""
    result = await db.execute(
        select(UTIInternacao).where(
            UTIInternacao.id == internacao_id, UTIInternacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internação não encontrada"
        )

    update_data = internacao_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(internacao, field, value)

    await db.commit()
    await db.refresh(internacao)
    return internacao


@router.delete("/{internacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_uti_internacao(
    internacao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete internação em UTI."""
    result = await db.execute(
        select(UTIInternacao).where(
            UTIInternacao.id == internacao_id, UTIInternacao.tenant_id == tenant_id
        )
    )
    internacao = result.scalar_one_or_none()
    if not internacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Internação não encontrada"
        )

    from datetime import datetime
    internacao.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_uti_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get UTI KPIs."""
    # Total internações
    result = await db.execute(
        select(func.count(UTIInternacao.id)).where(UTIInternacao.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Internados agora
    result = await db.execute(
        select(func.count(UTIInternacao.id)).where(
            UTIInternacao.tenant_id == tenant_id, UTIInternacao.status == "internado"
        )
    )
    internados = result.scalar() or 0

    # Óbitos
    result = await db.execute(
        select(func.count(UTIInternacao.id)).where(
            UTIInternacao.tenant_id == tenant_id, UTIInternacao.obito == True
        )
    )
    obitos = result.scalar() or 0

    # Média permanência
    result = await db.execute(
        select(func.avg(UTIInternacao.dias_permanencia)).where(
            UTIInternacao.tenant_id == tenant_id,
            UTIInternacao.dias_permanencia.isnot(None),
        )
    )
    media_permanencia = result.scalar() or 0

    # Taxa mortalidade
    taxa_mortalidade = (obitos / total * 100) if total > 0 else 0

    return {
        "total": total,
        "internados": internados,
        "obitos": obitos,
        "taxa_mortalidade": round(taxa_mortalidade, 2),
        "media_permanencia": round(float(media_permanencia), 1) if media_permanencia else 0,
    }
