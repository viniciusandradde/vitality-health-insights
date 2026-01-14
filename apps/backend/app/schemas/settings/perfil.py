"""Settings Perfil schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class PerfilResponse(BaseModel):
    """Perfil response schema."""

    id: UUID
    email: str
    nome: Optional[str] = None
    role: Optional[str] = None
    tenant_id: UUID
    ativo: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class PerfilUpdate(BaseModel):
    """Perfil update schema."""

    nome: Optional[str] = None
    email: Optional[EmailStr] = None
