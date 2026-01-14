"""Assistencial routes."""
from fastapi import APIRouter

from app.api.v1.assistencial.agendas import router as agendas_router
from app.api.v1.assistencial.ambulatorio import router as ambulatorio_router
from app.api.v1.assistencial.atendimentos import router as atendimentos_router
from app.api.v1.assistencial.ccih import router as ccih_router
from app.api.v1.assistencial.exames_imagem import router as exames_imagem_router
from app.api.v1.assistencial.exames_lab import router as exames_lab_router
from app.api.v1.assistencial.farmacia import router as farmacia_router
from app.api.v1.assistencial.fisioterapia import router as fisioterapia_router
from app.api.v1.assistencial.internacao import router as internacao_router
from app.api.v1.assistencial.nutricao import router as nutricao_router
from app.api.v1.assistencial.transfusional import router as transfusional_router
from app.api.v1.assistencial.uti import router as uti_router

assistencial_router = APIRouter(prefix="/assistencial")

assistencial_router.include_router(atendimentos_router)
assistencial_router.include_router(internacao_router)
assistencial_router.include_router(ambulatorio_router)
assistencial_router.include_router(agendas_router)
assistencial_router.include_router(exames_lab_router)
assistencial_router.include_router(exames_imagem_router)
assistencial_router.include_router(transfusional_router)
assistencial_router.include_router(farmacia_router)
assistencial_router.include_router(ccih_router)
assistencial_router.include_router(fisioterapia_router)
assistencial_router.include_router(nutricao_router)
assistencial_router.include_router(uti_router)