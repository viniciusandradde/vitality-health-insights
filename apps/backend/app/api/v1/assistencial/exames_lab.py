"""Exames laboratoriais routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.assistencial.exames_lab import ExameLaboratorial
from app.models.user import User
from app.schemas.assistencial.exames_lab import (
    ExameLaboratorialCreate,
    ExameLaboratorialResponse,
    ExameLaboratorialUpdate,
)

router = APIRouter(prefix="/exames-lab", tags=["Assistencial - Exames Laboratoriais"])


@router.get("", response_model=List[ExameLaboratorialResponse], status_code=status.HTTP_200_OK)
async def list_exames_lab(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List exames laboratoriais."""
    result = await db.execute(
        select(ExameLaboratorial)
        .where(ExameLaboratorial.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    exames = list(result.scalars().all())
    return exames


@router.post("", response_model=ExameLaboratorialResponse, status_code=status.HTTP_201_CREATED)
async def create_exame_lab(
    exame_data: ExameLaboratorialCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create exame laboratorial."""
    exame = ExameLaboratorial(**exame_data.model_dump(), tenant_id=tenant_id)
    db.add(exame)
    await db.commit()
    await db.refresh(exame)
    return exame


@router.get("/{exame_id}", response_model=ExameLaboratorialResponse, status_code=status.HTTP_200_OK)
async def get_exame_lab(
    exame_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get exame laboratorial by ID."""
    result = await db.execute(
        select(ExameLaboratorial).where(
            ExameLaboratorial.id == exame_id, ExameLaboratorial.tenant_id == tenant_id
        )
    )
    exame = result.scalar_one_or_none()
    if not exame:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Exame não encontrado"
        )
    return exame


@router.put("/{exame_id}", response_model=ExameLaboratorialResponse, status_code=status.HTTP_200_OK)
async def update_exame_lab(
    exame_id: UUID,
    exame_data: ExameLaboratorialUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update exame laboratorial."""
    result = await db.execute(
        select(ExameLaboratorial).where(
            ExameLaboratorial.id == exame_id, ExameLaboratorial.tenant_id == tenant_id
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
async def delete_exame_lab(
    exame_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete exame laboratorial."""
    result = await db.execute(
        select(ExameLaboratorial).where(
            ExameLaboratorial.id == exame_id, ExameLaboratorial.tenant_id == tenant_id
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
async def get_exames_lab_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get exames laboratoriais KPIs."""
    # Total exames
    result = await db.execute(
        select(func.count(ExameLaboratorial.id)).where(
            ExameLaboratorial.tenant_id == tenant_id
        )
    )
    total = result.scalar() or 0

    # Pendentes
    result = await db.execute(
        select(func.count(ExameLaboratorial.id)).where(
            ExameLaboratorial.tenant_id == tenant_id,
            ExameLaboratorial.status.in_(["solicitado", "coletado", "em_analise"]),
        )
    )
    pendentes = result.scalar() or 0

    # Concluídos
    result = await db.execute(
        select(func.count(ExameLaboratorial.id)).where(
            ExameLaboratorial.tenant_id == tenant_id, ExameLaboratorial.status == "concluido"
        )
    )
    concluidos = result.scalar() or 0

    return {
        "total": total,
        "pendentes": pendentes,
        "concluidos": concluidos,
        "taxa_conclusao": round((concluidos / total * 100) if total > 0 else 0, 2),
    }
