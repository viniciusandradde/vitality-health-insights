"""Assistencial routes."""
from fastapi import APIRouter

from app.api.v1.assistencial.atendimentos import router as atendimentos_router
from app.api.v1.assistencial.internacao import router as internacao_router

assistencial_router = APIRouter(prefix="/assistencial")

assistencial_router.include_router(atendimentos_router)
assistencial_router.include_router(internacao_router)
