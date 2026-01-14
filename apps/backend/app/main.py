"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import close_db, init_db
from app.core.middleware import setup_cors
from app.core.redis import close_redis, init_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    try:
        await init_db()
    except Exception as e:
        print(f"⚠️  Database initialization skipped: {e}")
    try:
        await init_redis()
    except Exception as e:
        print(f"⚠️  Redis initialization skipped: {e}")
    yield
    # Shutdown
    try:
        await close_db()
    except Exception:
        pass
    try:
        await close_redis()
    except Exception:
        pass


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# Setup middleware
setup_cors(app)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "VSA Analytics Health API",
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Import routers
from app.api.v1.router import api_router

app.include_router(api_router)
