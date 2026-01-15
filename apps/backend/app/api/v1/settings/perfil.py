"""Settings Perfil routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.user import User
from app.schemas.settings.perfil import PerfilResponse, PerfilUpdate

router = APIRouter(prefix="/perfil", tags=["Settings - Perfil"])


@router.get("", response_model=PerfilResponse, status_code=status.HTTP_200_OK)
async def get_perfil(
    current_user: User = Depends(get_current_user),
):
    """Get perfil do usuário atual."""
    return PerfilResponse(
        id=current_user.id,
        email=current_user.email,
        nome=current_user.full_name,
        role=current_user.role.name if current_user.role else None,
        tenant_id=current_user.tenant_id,
        ativo=current_user.is_active,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        updated_at=current_user.updated_at.isoformat() if current_user.updated_at else None,
    )


@router.put("", response_model=PerfilResponse, status_code=status.HTTP_200_OK)
async def update_perfil(
    perfil_data: PerfilUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update perfil do usuário atual."""
    update_data = perfil_data.model_dump(exclude_unset=True)
    # Mapear nome para full_name
    if "nome" in update_data:
        update_data["full_name"] = update_data.pop("nome")
    
    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return PerfilResponse(
        id=current_user.id,
        email=current_user.email,
        nome=current_user.full_name,
        role=current_user.role.name if current_user.role else None,
        tenant_id=current_user.tenant_id,
        ativo=current_user.is_active,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        updated_at=current_user.updated_at.isoformat() if current_user.updated_at else None,
    )
