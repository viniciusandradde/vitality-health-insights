"""Settings Notificações routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.settings.notificacoes import NotificacaoConfig
from app.models.user import User
from app.schemas.settings.notificacoes import NotificacoesResponse, NotificacoesUpdate

router = APIRouter(prefix="/notificacoes", tags=["Settings - Notificações"])


@router.get("", response_model=NotificacoesResponse, status_code=status.HTTP_200_OK)
async def get_notificacoes(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get configurações de notificações."""
    result = await db.execute(
        select(NotificacaoConfig).where(NotificacaoConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        # Criar configuração padrão
        config = NotificacaoConfig(
            tenant_id=tenant_id,
            email_enabled=True,
            email_kpis_diarios=True,
            email_alertas=True,
            push_enabled=True,
            push_alertas_criticos=True,
            sms_enabled=False,
            sms_alertas_criticos=False,
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)

    return NotificacoesResponse(
        email_enabled=config.email_enabled,
        email_kpis_diarios=config.email_kpis_diarios,
        email_alertas=config.email_alertas,
        push_enabled=config.push_enabled,
        push_alertas_criticos=config.push_alertas_criticos,
        sms_enabled=config.sms_enabled,
        sms_alertas_criticos=config.sms_alertas_criticos,
    )


@router.put("", response_model=NotificacoesResponse, status_code=status.HTTP_200_OK)
async def update_notificacoes(
    notificacoes_data: NotificacoesUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update configurações de notificações."""
    result = await db.execute(
        select(NotificacaoConfig).where(NotificacaoConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        # Criar nova configuração
        config = NotificacaoConfig(tenant_id=tenant_id)
        db.add(config)

    update_data = notificacoes_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    await db.commit()
    await db.refresh(config)

    return NotificacoesResponse(
        email_enabled=config.email_enabled,
        email_kpis_diarios=config.email_kpis_diarios,
        email_alertas=config.email_alertas,
        push_enabled=config.push_enabled,
        push_alertas_criticos=config.push_alertas_criticos,
        sms_enabled=config.sms_enabled,
        sms_alertas_criticos=config.sms_alertas_criticos,
    )
