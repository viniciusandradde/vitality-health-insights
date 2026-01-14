"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.admin import admin_router
from app.api.v1.assistencial import assistencial_router
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.dashboard.routes import router as dashboard_router
from app.api.v1.gerencial import gerencial_router
from app.api.v1.integrations.erp.routes import router as erp_router
from app.api.v1.settings import settings_router

api_router = APIRouter(prefix="/api/v1")

# Include routers
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(dashboard_router)
api_router.include_router(assistencial_router)
api_router.include_router(gerencial_router)
api_router.include_router(settings_router)
api_router.include_router(erp_router, prefix="/integrations")