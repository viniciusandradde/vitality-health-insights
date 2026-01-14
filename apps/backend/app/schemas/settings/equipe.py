"""Settings Equipe schemas."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UsuarioEquipeResponse(BaseModel):
    """Usuário equipe response schema."""

    id: UUID
    email: str
    nome: Optional[str] = None
    role: Optional[str] = None
    ativo: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UsuarioEquipeCreate(BaseModel):
    """Usuário equipe creation schema."""

    email: EmailStr
    nome: Optional[str] = None
    password: str
    role: str


class UsuarioEquipeUpdate(BaseModel):
    """Usuário equipe update schema."""

    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    ativo: Optional[bool] = None
