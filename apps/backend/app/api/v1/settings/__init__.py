"""Settings routes."""
from fastapi import APIRouter

from app.api.v1.settings.equipe import router as equipe_router
from app.api.v1.settings.integracoes import router as integracoes_router
from app.api.v1.settings.modulos import router as modulos_router
from app.api.v1.settings.notificacoes import router as notificacoes_router
from app.api.v1.settings.organizacao import router as organizacao_router
from app.api.v1.settings.perfil import router as perfil_router
from app.api.v1.settings.plano import router as plano_router
from app.api.v1.settings.seguranca import router as seguranca_router

settings_router = APIRouter(prefix="/settings")

settings_router.include_router(perfil_router)
settings_router.include_router(organizacao_router)
settings_router.include_router(equipe_router)
settings_router.include_router(modulos_router)
settings_router.include_router(integracoes_router)
settings_router.include_router(notificacoes_router)
settings_router.include_router(seguranca_router)
settings_router.include_router(plano_router)
