"""Settings Segurança routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.settings.seguranca import SegurancaConfig
from app.models.user import User
from app.schemas.settings.seguranca import SegurancaResponse, SegurancaUpdate

router = APIRouter(prefix="/seguranca", tags=["Settings - Segurança"])


@router.get("", response_model=SegurancaResponse, status_code=status.HTTP_200_OK)
async def get_seguranca(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get configurações de segurança."""
    result = await db.execute(
        select(SegurancaConfig).where(SegurancaConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        # Criar configuração padrão
        config = SegurancaConfig(
            tenant_id=tenant_id,
            mfa_enabled=False,
            password_min_length=8,
            password_require_uppercase=True,
            password_require_lowercase=True,
            password_require_numbers=True,
            password_require_special=False,
            session_timeout_minutes=30,
            max_login_attempts=5,
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)

    return SegurancaResponse(
        mfa_enabled=config.mfa_enabled,
        password_min_length=config.password_min_length,
        password_require_uppercase=config.password_require_uppercase,
        password_require_lowercase=config.password_require_lowercase,
        password_require_numbers=config.password_require_numbers,
        password_require_special=config.password_require_special,
        session_timeout_minutes=config.session_timeout_minutes,
        max_login_attempts=config.max_login_attempts,
    )


@router.put("", response_model=SegurancaResponse, status_code=status.HTTP_200_OK)
async def update_seguranca(
    seguranca_data: SegurancaUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update configurações de segurança."""
    result = await db.execute(
        select(SegurancaConfig).where(SegurancaConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()

    if not config:
        # Criar nova configuração
        config = SegurancaConfig(tenant_id=tenant_id)
        db.add(config)

    update_data = seguranca_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    await db.commit()
    await db.refresh(config)

    return SegurancaResponse(
        mfa_enabled=config.mfa_enabled,
        password_min_length=config.password_min_length,
        password_require_uppercase=config.password_require_uppercase,
        password_require_lowercase=config.password_require_lowercase,
        password_require_numbers=config.password_require_numbers,
        password_require_special=config.password_require_special,
        session_timeout_minutes=config.session_timeout_minutes,
        max_login_attempts=config.max_login_attempts,
    )
