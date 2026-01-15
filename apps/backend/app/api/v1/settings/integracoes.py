"""Settings Integrações routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.settings.integracoes import Integracao
from app.models.user import User
from app.schemas.settings.integracoes import (
    IntegracaoCreate,
    IntegracaoResponse,
    IntegracaoUpdate,
)

router = APIRouter(prefix="/integracoes", tags=["Settings - Integrações"])


@router.get("", response_model=List[IntegracaoResponse], status_code=status.HTTP_200_OK)
async def list_integracoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List integrações."""
    result = await db.execute(
        select(Integracao)
        .where(Integracao.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    integracoes = list(result.scalars().all())
    import json
    return [
        IntegracaoResponse(
            id=i.id,
            nome=i.nome,
            tipo=i.tipo,
            url=i.url,
            api_key=i.api_key,  # TODO: Descriptografar em produção
            config=json.loads(i.config) if i.config else None,
            ativo=i.ativo,
            tenant_id=i.tenant_id,
            created_at=i.created_at.isoformat() if i.created_at else None,
            updated_at=i.updated_at.isoformat() if i.updated_at else None,
        )
        for i in integracoes
    ]


@router.post("", response_model=IntegracaoResponse, status_code=status.HTTP_201_CREATED)
async def create_integracao(
    integracao_data: IntegracaoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create integração."""
    import json
    integracao = Integracao(
        nome=integracao_data.nome,
        tipo=integracao_data.tipo,
        url=integracao_data.url,
        api_key=integracao_data.api_key,  # TODO: Criptografar em produção
        config=json.dumps(integracao_data.config) if integracao_data.config else None,
        ativo=integracao_data.ativo,
        tenant_id=tenant_id,
    )
    db.add(integracao)
    await db.commit()
    await db.refresh(integracao)

    return IntegracaoResponse(
        id=integracao.id,
        nome=integracao.nome,
        tipo=integracao.tipo,
        url=integracao.url,
        api_key=integracao.api_key,
        config=json.loads(integracao.config) if integracao.config else None,
        ativo=integracao.ativo,
        tenant_id=integracao.tenant_id,
        created_at=integracao.created_at.isoformat() if integracao.created_at else None,
        updated_at=integracao.updated_at.isoformat() if integracao.updated_at else None,
    )


@router.get("/{integracao_id}", response_model=IntegracaoResponse, status_code=status.HTTP_200_OK)
async def get_integracao(
    integracao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get integração by ID."""
    result = await db.execute(
        select(Integracao).where(
            Integracao.id == integracao_id, Integracao.tenant_id == tenant_id
        )
    )
    integracao = result.scalar_one_or_none()
    if not integracao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integração não encontrada"
        )

    import json
    return IntegracaoResponse(
        id=integracao.id,
        nome=integracao.nome,
        tipo=integracao.tipo,
        url=integracao.url,
        api_key=integracao.api_key,
        config=json.loads(integracao.config) if integracao.config else None,
        ativo=integracao.ativo,
        tenant_id=integracao.tenant_id,
        created_at=integracao.created_at.isoformat() if integracao.created_at else None,
        updated_at=integracao.updated_at.isoformat() if integracao.updated_at else None,
    )


@router.put("/{integracao_id}", response_model=IntegracaoResponse, status_code=status.HTTP_200_OK)
async def update_integracao(
    integracao_id: UUID,
    integracao_data: IntegracaoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update integração."""
    result = await db.execute(
        select(Integracao).where(
            Integracao.id == integracao_id, Integracao.tenant_id == tenant_id
        )
    )
    integracao = result.scalar_one_or_none()
    if not integracao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integração não encontrada"
        )

    import json
    update_data = integracao_data.model_dump(exclude_unset=True)
    if "config" in update_data and update_data["config"]:
        update_data["config"] = json.dumps(update_data["config"])

    for field, value in update_data.items():
        setattr(integracao, field, value)

    await db.commit()
    await db.refresh(integracao)

    return IntegracaoResponse(
        id=integracao.id,
        nome=integracao.nome,
        tipo=integracao.tipo,
        url=integracao.url,
        api_key=integracao.api_key,
        config=json.loads(integracao.config) if integracao.config else None,
        ativo=integracao.ativo,
        tenant_id=integracao.tenant_id,
        created_at=integracao.created_at.isoformat() if integracao.created_at else None,
        updated_at=integracao.updated_at.isoformat() if integracao.updated_at else None,
    )


@router.delete("/{integracao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integracao(
    integracao_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete integração."""
    result = await db.execute(
        select(Integracao).where(
            Integracao.id == integracao_id, Integracao.tenant_id == tenant_id
        )
    )
    integracao = result.scalar_one_or_none()
    if not integracao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Integração não encontrada"
        )

    from datetime import datetime
    integracao.deleted_at = datetime.utcnow()
    await db.commit()
