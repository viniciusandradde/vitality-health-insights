"""Settings Módulos routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth.dependencies import get_current_user, get_current_tenant_id
from app.core.database import get_db
from app.models.settings.modulos import ModuloConfig
from app.models.user import User
from app.schemas.settings.modulos import (
    ModuloConfigResponse,
    ModuloConfigUpdate,
    ModulosResponse,
)

router = APIRouter(prefix="/modulos", tags=["Settings - Módulos"])

# Lista de módulos disponíveis
MODULOS_DISPONIVEIS = [
    "atendimentos",
    "internacao",
    "ambulatorio",
    "agendas",
    "exames-lab",
    "exames-imagem",
    "transfusional",
    "farmacia",
    "ccih",
    "fisioterapia",
    "nutricao",
    "uti",
    "estoque",
    "faturamento",
    "financeiro",
    "higienizacao",
    "lavanderia",
    "sesmt",
    "ti",
    "hotelaria",
    "spp",
]


import json

@router.get("", response_model=ModulosResponse, status_code=status.HTTP_200_OK)
async def get_modulos(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get configurações de módulos."""
    result = await db.execute(
        select(ModuloConfig).where(ModuloConfig.tenant_id == tenant_id)
    )
    configs = {config.modulo_id: config for config in result.scalars().all()}

    # Criar resposta com todos os módulos (habilitados por padrão se não configurados)
    modulos_dict = {}
    for modulo_id in MODULOS_DISPONIVEIS:
        if modulo_id in configs:
            config = configs[modulo_id]
            modulos_dict[modulo_id] = ModuloConfigResponse(
                modulo_id=config.modulo_id,
                enabled=config.enabled,
                config=json.loads(config.config) if config.config else None,
            )
        else:
            modulos_dict[modulo_id] = ModuloConfigResponse(
                modulo_id=modulo_id,
                enabled=True,  # Padrão: habilitado
                config=None,
            )

    return ModulosResponse(modulos=modulos_dict)


@router.put("/{modulo_id}", response_model=ModuloConfigResponse, status_code=status.HTTP_200_OK)
async def update_modulo(
    modulo_id: str,
    modulo_data: ModuloConfigUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update configuração de módulo."""
    if modulo_id not in MODULOS_DISPONIVEIS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Módulo não encontrado",
        )

    result = await db.execute(
        select(ModuloConfig).where(
            ModuloConfig.modulo_id == modulo_id, ModuloConfig.tenant_id == tenant_id
        )
    )
    config = result.scalar_one_or_none()

    if not config:
        # Criar nova configuração
        import json
        config = ModuloConfig(
            modulo_id=modulo_id,
            tenant_id=tenant_id,
            enabled=modulo_data.enabled if modulo_data.enabled is not None else True,
            config=json.dumps(modulo_data.config) if modulo_data.config else None,
        )
        db.add(config)
    else:
        # Atualizar existente
        update_data = modulo_data.model_dump(exclude_unset=True)
        if "config" in update_data and update_data["config"]:
            import json
            update_data["config"] = json.dumps(update_data["config"])
        for field, value in update_data.items():
            setattr(config, field, value)

    await db.commit()
    await db.refresh(config)

    import json
    return ModuloConfigResponse(
        modulo_id=config.modulo_id,
        enabled=config.enabled,
        config=json.loads(config.config) if config.config else None,
    )
