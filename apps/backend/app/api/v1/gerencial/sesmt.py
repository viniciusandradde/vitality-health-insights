"""SESMT routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.sesmt import OcorrenciaSESMT
from app.models.user import User
from app.schemas.gerencial.sesmt import (
    OcorrenciaSESMTCreate,
    OcorrenciaSESMTResponse,
    OcorrenciaSESMTUpdate,
)

router = APIRouter(prefix="/sesmt", tags=["Gerencial - SESMT"])


@router.get("", response_model=List[OcorrenciaSESMTResponse], status_code=status.HTTP_200_OK)
async def list_ocorrencias_sesmt(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List ocorrências SESMT."""
    result = await db.execute(
        select(OcorrenciaSESMT)
        .where(OcorrenciaSESMT.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    ocorrencias = list(result.scalars().all())
    return ocorrencias


@router.post("", response_model=OcorrenciaSESMTResponse, status_code=status.HTTP_201_CREATED)
async def create_ocorrencia_sesmt(
    ocorrencia_data: OcorrenciaSESMTCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create ocorrência SESMT."""
    ocorrencia = OcorrenciaSESMT(**ocorrencia_data.model_dump(), tenant_id=tenant_id)
    db.add(ocorrencia)
    await db.commit()
    await db.refresh(ocorrencia)
    return ocorrencia


@router.get("/{ocorrencia_id}", response_model=OcorrenciaSESMTResponse, status_code=status.HTTP_200_OK)
async def get_ocorrencia_sesmt(
    ocorrencia_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ocorrência SESMT by ID."""
    result = await db.execute(
        select(OcorrenciaSESMT).where(
            OcorrenciaSESMT.id == ocorrencia_id, OcorrenciaSESMT.tenant_id == tenant_id
        )
    )
    ocorrencia = result.scalar_one_or_none()
    if not ocorrencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrência não encontrada"
        )
    return ocorrencia


@router.put("/{ocorrencia_id}", response_model=OcorrenciaSESMTResponse, status_code=status.HTTP_200_OK)
async def update_ocorrencia_sesmt(
    ocorrencia_id: UUID,
    ocorrencia_data: OcorrenciaSESMTUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update ocorrência SESMT."""
    result = await db.execute(
        select(OcorrenciaSESMT).where(
            OcorrenciaSESMT.id == ocorrencia_id, OcorrenciaSESMT.tenant_id == tenant_id
        )
    )
    ocorrencia = result.scalar_one_or_none()
    if not ocorrencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrência não encontrada"
        )

    update_data = ocorrencia_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ocorrencia, field, value)

    await db.commit()
    await db.refresh(ocorrencia)
    return ocorrencia


@router.delete("/{ocorrencia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ocorrencia_sesmt(
    ocorrencia_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete ocorrência SESMT."""
    result = await db.execute(
        select(OcorrenciaSESMT).where(
            OcorrenciaSESMT.id == ocorrencia_id, OcorrenciaSESMT.tenant_id == tenant_id
        )
    )
    ocorrencia = result.scalar_one_or_none()
    if not ocorrencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ocorrência não encontrada"
        )

    from datetime import datetime
    ocorrencia.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_sesmt_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SESMT KPIs."""
    # Total ocorrências
    result = await db.execute(
        select(func.count(OcorrenciaSESMT.id)).where(OcorrenciaSESMT.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Por gravidade
    result = await db.execute(
        select(
            OcorrenciaSESMT.gravidade,
            func.count(OcorrenciaSESMT.id).label("count"),
        )
        .where(OcorrenciaSESMT.tenant_id == tenant_id)
        .group_by(OcorrenciaSESMT.gravidade)
    )
    por_gravidade = {row.gravidade: row.count for row in result.all()}

    # Por tipo
    result = await db.execute(
        select(
            OcorrenciaSESMT.tipo_ocorrencia,
            func.count(OcorrenciaSESMT.id).label("count"),
        )
        .where(OcorrenciaSESMT.tenant_id == tenant_id)
        .group_by(OcorrenciaSESMT.tipo_ocorrencia)
    )
    por_tipo = {row.tipo_ocorrencia: row.count for row in result.all()}

    return {
        "total": total,
        "por_gravidade": por_gravidade,
        "por_tipo": por_tipo,
    }
