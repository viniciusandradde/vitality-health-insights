"""Middleware for request processing."""
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware to extract and set tenant_id from JWT token."""

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Extract tenant_id from JWT and set in request state."""
        # Extract token from Authorization header
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            # Decode token to get tenant_id (will be implemented in security module)
            # For now, set a placeholder
            request.state.tenant_id = None

        response = await call_next(request)
        return response


def setup_cors(app) -> None:
    """Setup CORS middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
