"""Admin routes."""
from fastapi import APIRouter

from app.api.v1.admin.audit import router as audit_router
from app.api.v1.admin.billing import router as billing_router
from app.api.v1.admin.integrations import router as integrations_router
from app.api.v1.admin.plans import router as plans_router
from app.api.v1.admin.roles import router as roles_router
from app.api.v1.admin.tenants import router as tenants_router
from app.api.v1.admin.users import router as users_router

admin_router = APIRouter(prefix="/admin")

admin_router.include_router(tenants_router)
admin_router.include_router(users_router)
admin_router.include_router(roles_router)
admin_router.include_router(integrations_router)
admin_router.include_router(plans_router)
admin_router.include_router(billing_router)
admin_router.include_router(audit_router)
