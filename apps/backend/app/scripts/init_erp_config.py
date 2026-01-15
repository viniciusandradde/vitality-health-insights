"""Script to initialize ERP configuration from environment variables."""
import json
import os
import logging
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.settings.integracoes import Integracao
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


async def init_erp_config_for_all_tenants():
    """
    Initialize ERP configuration for all tenants from environment variables.
    
    Reads ERP_* environment variables and creates/updates integracao records
    for all active tenants that don't have an ERP integration yet.
    """
    # Read ERP configuration from environment
    erp_type = os.getenv("ERP_TYPE", "postgresql")
    erp_host = os.getenv("ERP_HOST")
    erp_port = int(os.getenv("ERP_PORT", "5432"))
    erp_database = os.getenv("ERP_DATABASE")
    erp_username = os.getenv("ERP_USERNAME")
    erp_password = os.getenv("ERP_PASSWORD")
    erp_ssl_mode = os.getenv("ERP_SSL_MODE", "disable")
    erp_timeout = int(os.getenv("ERP_TIMEOUT", "30"))
    erp_max_connections = int(os.getenv("ERP_MAX_CONNECTIONS", "5"))
    
    # Validate required fields
    if not all([erp_host, erp_database, erp_username, erp_password]):
        logger.warning(
            "ERP configuration incomplete. Missing required environment variables: "
            "ERP_HOST, ERP_DATABASE, ERP_USERNAME, ERP_PASSWORD"
        )
        return
    
    # Build config JSON
    config_dict = {
        "erp_type": erp_type,
        "erp_host": erp_host,
        "erp_port": erp_port,
        "erp_database_name": erp_database,
        "erp_username": erp_username,
        "erp_password": erp_password,
        "erp_ssl_mode": erp_ssl_mode,
        "erp_timeout_seconds": erp_timeout,
        "erp_max_connections": erp_max_connections,
        "erp_enabled": True,
    }
    config_json = json.dumps(config_dict)
    
    async with AsyncSessionLocal() as db:
        try:
            # Get all active tenants
            result = await db.execute(
                select(Tenant).where(Tenant.deleted_at.is_(None))
            )
            tenants = result.scalars().all()
            
            if not tenants:
                logger.info("No tenants found. Skipping ERP config initialization.")
                return
            
            logger.info(f"Found {len(tenants)} tenant(s). Checking ERP configuration...")
            
            for tenant in tenants:
                # Check if ERP integration already exists for this tenant
                integracao_result = await db.execute(
                    select(Integracao).where(
                        Integracao.tenant_id == tenant.id,
                        Integracao.tipo == "erp",
                        Integracao.deleted_at.is_(None),
                    )
                )
                existing = integracao_result.scalar_one_or_none()
                
                if existing:
                    logger.info(
                        f"ERP integration already exists for tenant {tenant.id} ({tenant.name}). "
                        "Skipping."
                    )
                    continue
                
                # Create new ERP integration
                integracao = Integracao(
                    id=uuid4(),
                    nome="ERP Wareline",
                    tipo="erp",
                    config=config_json,
                    ativo=True,
                    tenant_id=tenant.id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                
                db.add(integracao)
                logger.info(
                    f"Created ERP integration for tenant {tenant.id} ({tenant.name})"
                )
            
            await db.commit()
            logger.info("ERP configuration initialization completed successfully.")
            
        except Exception as e:
            logger.error(f"Error initializing ERP configuration: {e}", exc_info=True)
            await db.rollback()
            raise


async def init_erp_config_for_tenant(tenant_id: UUID):
    """
    Initialize ERP configuration for a specific tenant.
    
    Args:
        tenant_id: UUID of the tenant to configure
    """
    # Read ERP configuration from environment
    erp_type = os.getenv("ERP_TYPE", "postgresql")
    erp_host = os.getenv("ERP_HOST")
    erp_port = int(os.getenv("ERP_PORT", "5432"))
    erp_database = os.getenv("ERP_DATABASE")
    erp_username = os.getenv("ERP_USERNAME")
    erp_password = os.getenv("ERP_PASSWORD")
    erp_ssl_mode = os.getenv("ERP_SSL_MODE", "disable")
    erp_timeout = int(os.getenv("ERP_TIMEOUT", "30"))
    erp_max_connections = int(os.getenv("ERP_MAX_CONNECTIONS", "5"))
    
    # Validate required fields
    if not all([erp_host, erp_database, erp_username, erp_password]):
        raise ValueError(
            "ERP configuration incomplete. Missing required environment variables: "
            "ERP_HOST, ERP_DATABASE, ERP_USERNAME, ERP_PASSWORD"
        )
    
    # Build config JSON
    config_dict = {
        "erp_type": erp_type,
        "erp_host": erp_host,
        "erp_port": erp_port,
        "erp_database_name": erp_database,
        "erp_username": erp_username,
        "erp_password": erp_password,
        "erp_ssl_mode": erp_ssl_mode,
        "erp_timeout_seconds": erp_timeout,
        "erp_max_connections": erp_max_connections,
        "erp_enabled": True,
    }
    config_json = json.dumps(config_dict)
    
    async with AsyncSessionLocal() as db:
        # Check if ERP integration already exists
        integracao_result = await db.execute(
            select(Integracao).where(
                Integracao.tenant_id == tenant_id,
                Integracao.tipo == "erp",
                Integracao.deleted_at.is_(None),
            )
        )
        existing = integracao_result.scalar_one_or_none()
        
        if existing:
            # Update existing
            existing.config = config_json
            existing.updated_at = datetime.utcnow()
            logger.info(f"Updated ERP integration for tenant {tenant_id}")
        else:
            # Create new
            integracao = Integracao(
                id=uuid4(),
                nome="ERP Wareline",
                tipo="erp",
                config=config_json,
                ativo=True,
                tenant_id=tenant_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(integracao)
            logger.info(f"Created ERP integration for tenant {tenant_id}")
        
        await db.commit()
