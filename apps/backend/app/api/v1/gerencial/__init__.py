"""Gerencial routes."""
from fastapi import APIRouter

from app.api.v1.gerencial.estoque import router as estoque_router
from app.api.v1.gerencial.faturamento import router as faturamento_router
from app.api.v1.gerencial.financeiro import router as financeiro_router
from app.api.v1.gerencial.higienizacao import router as higienizacao_router
from app.api.v1.gerencial.hotelaria import router as hotelaria_router
from app.api.v1.gerencial.lavanderia import router as lavanderia_router
from app.api.v1.gerencial.nutricao_gerencial import router as nutricao_gerencial_router
from app.api.v1.gerencial.sesmt import router as sesmt_router
from app.api.v1.gerencial.spp import router as spp_router
from app.api.v1.gerencial.ti import router as ti_router

gerencial_router = APIRouter(prefix="/gerencial")

gerencial_router.include_router(estoque_router)
gerencial_router.include_router(faturamento_router)
gerencial_router.include_router(financeiro_router)
gerencial_router.include_router(higienizacao_router)
gerencial_router.include_router(lavanderia_router)
gerencial_router.include_router(sesmt_router)
gerencial_router.include_router(ti_router)
gerencial_router.include_router(hotelaria_router)
gerencial_router.include_router(spp_router)
gerencial_router.include_router(nutricao_gerencial_router)
