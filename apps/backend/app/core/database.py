"""Database configuration and session management."""
from typing import AsyncGenerator, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.database_url_async,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
)

# Create async session factory (SQLAlchemy 1.4 compatible)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_with_tenant(
    tenant_id: Optional[UUID] = None,
) -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session with tenant_id configured for RLS.
    
    This sets the app.current_tenant_id session variable which is used by
    Row Level Security policies to filter data by tenant.
    
    Note: This should be used in combination with get_current_tenant_id dependency
    to automatically configure RLS for authenticated requests.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Set tenant_id in session for RLS
            if tenant_id:
                await session.execute(
                    text("SET LOCAL app.current_tenant_id = :tenant_id"),
                    {"tenant_id": str(tenant_id)}
                )
            else:
                # Clear tenant_id if None
                await session.execute(
                    text("SET LOCAL app.current_tenant_id = ''")
                )
            
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database (create tables)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()
