"""Estoque routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.gerencial.estoque import ItemEstoque
from app.models.user import User
from app.schemas.gerencial.estoque import (
    ItemEstoqueCreate,
    ItemEstoqueResponse,
    ItemEstoqueUpdate,
)

router = APIRouter(prefix="/estoque", tags=["Gerencial - Estoque"])


@router.get("", response_model=List[ItemEstoqueResponse], status_code=status.HTTP_200_OK)
async def list_itens_estoque(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List itens de estoque."""
    result = await db.execute(
        select(ItemEstoque)
        .where(ItemEstoque.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    itens = list(result.scalars().all())
    return itens


@router.post("", response_model=ItemEstoqueResponse, status_code=status.HTTP_201_CREATED)
async def create_item_estoque(
    item_data: ItemEstoqueCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create item de estoque."""
    # Verificar se código já existe
    result = await db.execute(
        select(ItemEstoque).where(
            ItemEstoque.codigo == item_data.codigo, ItemEstoque.tenant_id == tenant_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código já existe para este tenant",
        )

    item = ItemEstoque(**item_data.model_dump(), tenant_id=tenant_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemEstoqueResponse, status_code=status.HTTP_200_OK)
async def get_item_estoque(
    item_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get item de estoque by ID."""
    result = await db.execute(
        select(ItemEstoque).where(
            ItemEstoque.id == item_id, ItemEstoque.tenant_id == tenant_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )
    return item


@router.put("/{item_id}", response_model=ItemEstoqueResponse, status_code=status.HTTP_200_OK)
async def update_item_estoque(
    item_id: UUID,
    item_data: ItemEstoqueUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update item de estoque."""
    result = await db.execute(
        select(ItemEstoque).where(
            ItemEstoque.id == item_id, ItemEstoque.tenant_id == tenant_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )

    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item_estoque(
    item_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete item de estoque."""
    result = await db.execute(
        select(ItemEstoque).where(
            ItemEstoque.id == item_id, ItemEstoque.tenant_id == tenant_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )

    from datetime import datetime
    item.deleted_at = datetime.utcnow()
    await db.commit()


@router.get("/kpis", status_code=status.HTTP_200_OK)
async def get_estoque_kpis(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get estoque KPIs."""
    # Total itens
    result = await db.execute(
        select(func.count(ItemEstoque.id)).where(ItemEstoque.tenant_id == tenant_id)
    )
    total = result.scalar() or 0

    # Itens abaixo do mínimo
    result = await db.execute(
        select(func.count(ItemEstoque.id)).where(
            ItemEstoque.tenant_id == tenant_id,
            ItemEstoque.quantidade_atual < ItemEstoque.quantidade_minima,
        )
    )
    abaixo_minimo = result.scalar() or 0

    # Valor total do estoque
    result = await db.execute(
        select(func.sum(ItemEstoque.quantidade_atual * ItemEstoque.valor_unitario)).where(
            ItemEstoque.tenant_id == tenant_id, ItemEstoque.valor_unitario.isnot(None)
        )
    )
    valor_total = result.scalar() or 0

    return {
        "total": total,
        "abaixo_minimo": abaixo_minimo,
        "valor_total": float(valor_total) if valor_total else 0,
        "taxa_critico": round((abaixo_minimo / total * 100) if total > 0 else 0, 2),
    }
