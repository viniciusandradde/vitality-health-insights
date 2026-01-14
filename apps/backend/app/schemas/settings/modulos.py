"""Settings Módulos schemas."""
from typing import Dict, Optional
from uuid import UUID
from pydantic import BaseModel


class ModuloConfigResponse(BaseModel):
    """Módulo config response schema."""

    modulo_id: str
    enabled: bool
    config: Optional[Dict] = None

    class Config:
        from_attributes = True


class ModulosResponse(BaseModel):
    """Módulos response schema."""

    modulos: Dict[str, ModuloConfigResponse]


class ModuloConfigUpdate(BaseModel):
    """Módulo config update schema."""

    enabled: Optional[bool] = None
    config: Optional[Dict] = None
