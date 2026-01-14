"""Settings Equipe routes."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.user import User
from app.schemas.settings.equipe import UsuarioEquipeCreate, UsuarioEquipeResponse, UsuarioEquipeUpdate

router = APIRouter(prefix="/equipe", tags=["Settings - Equipe"])


@router.get("", response_model=List[UsuarioEquipeResponse], status_code=status.HTTP_200_OK)
async def list_equipe(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List usuários da equipe (tenant)."""
    result = await db.execute(
        select(User)
        .where(User.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
    )
    usuarios = list(result.scalars().all())
    return [
        UsuarioEquipeResponse(
            id=u.id,
            email=u.email,
            nome=u.full_name,
            role=u.role.name if u.role else None,
            ativo=u.is_active,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in usuarios
    ]


@router.post("", response_model=UsuarioEquipeResponse, status_code=status.HTTP_201_CREATED)
async def create_usuario_equipe(
    usuario_data: UsuarioEquipeCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create usuário na equipe."""
    from app.core.security import get_password_hash

    # Verificar se email já existe
    result = await db.execute(
        select(User).where(User.email == usuario_data.email, User.tenant_id == tenant_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já existe para este tenant",
        )

    # Buscar role
    from app.models.user import Role
    result = await db.execute(
        select(Role).where(Role.name == usuario_data.role)
    )
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role não encontrada",
        )

    usuario = User(
        email=usuario_data.email,
        full_name=usuario_data.nome or "",
        hashed_password=get_password_hash(usuario_data.password),
        tenant_id=tenant_id,
        role_id=role.id,
        is_active=True,
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)

    return UsuarioEquipeResponse(
        id=usuario.id,
        email=usuario.email,
        nome=usuario.full_name,
        role=role.name,
        ativo=usuario.is_active,
        created_at=usuario.created_at.isoformat() if usuario.created_at else None,
    )


@router.get("/{usuario_id}", response_model=UsuarioEquipeResponse, status_code=status.HTTP_200_OK)
async def get_usuario_equipe(
    usuario_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get usuário da equipe by ID."""
    result = await db.execute(
        select(User).where(User.id == usuario_id, User.tenant_id == tenant_id)
    )
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    return UsuarioEquipeResponse(
        id=usuario.id,
        email=usuario.email,
        nome=usuario.full_name,
        role=usuario.role.name if usuario.role else None,
        ativo=usuario.is_active,
        created_at=usuario.created_at.isoformat() if usuario.created_at else None,
    )


@router.put("/{usuario_id}", response_model=UsuarioEquipeResponse, status_code=status.HTTP_200_OK)
async def update_usuario_equipe(
    usuario_id: UUID,
    usuario_data: UsuarioEquipeUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update usuário da equipe."""
    result = await db.execute(
        select(User).where(User.id == usuario_id, User.tenant_id == tenant_id)
    )
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    update_data = usuario_data.model_dump(exclude_unset=True)

    # Mapear nome para full_name
    if "nome" in update_data:
        update_data["full_name"] = update_data.pop("nome")

    # Se mudou role, buscar nova role
    if "role" in update_data:
        from app.models.user import Role
        result = await db.execute(
            select(Role).where(Role.name == update_data["role"])
        )
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role não encontrada",
            )
        update_data["role_id"] = role.id
        del update_data["role"]

    # Se mudou senha, fazer hash
    if "password" in update_data:
        from app.core.security import get_password_hash
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]

    # Mapear ativo para is_active
    if "ativo" in update_data:
        update_data["is_active"] = update_data.pop("ativo")

    for field, value in update_data.items():
        setattr(usuario, field, value)

    await db.commit()
    await db.refresh(usuario)

    return UsuarioEquipeResponse(
        id=usuario.id,
        email=usuario.email,
        nome=usuario.full_name,
        role=usuario.role.name if usuario.role else None,
        ativo=usuario.is_active,
        created_at=usuario.created_at.isoformat() if usuario.created_at else None,
    )


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_usuario_equipe(
    usuario_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete usuário da equipe."""
    result = await db.execute(
        select(User).where(User.id == usuario_id, User.tenant_id == tenant_id)
    )
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    from datetime import datetime
    usuario.deleted_at = datetime.utcnow()
    await db.commit()
