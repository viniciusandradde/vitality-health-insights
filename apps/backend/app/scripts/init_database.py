"""Script to initialize database with migrations and seed data."""
import asyncio
import subprocess
import sys
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine
from app.models.user import Role, User, Tenant
from app.core.security import get_password_hash


async def run_migrations():
    """Run alembic migrations."""
    print("🔄 Running database migrations...")
    try:
        result = subprocess.run(
            ["python", "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd="/app"
        )
        if result.returncode == 0:
            print("✅ Migrations applied successfully")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"⚠️  Migration warning: {result.stderr}")
    except Exception as e:
        print(f"⚠️  Could not run migrations: {e}")


async def check_tables_exist() -> bool:
    """Check if the required tables exist."""
    async with engine.begin() as conn:
        try:
            result = await conn.execute(
                text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles')")
            )
            return result.scalar()
        except Exception:
            return False


async def create_master_role(db: AsyncSession) -> Role:
    """Create master role if it doesn't exist."""
    master_role_id = UUID("00000000-0000-0000-0000-000000000001")
    
    result = await db.execute(
        select(Role).where(Role.id == master_role_id)
    )
    existing_role = result.scalar_one_or_none()
    
    if existing_role:
        print(f"✅ Role 'master' already exists")
        return existing_role
    
    master_role = Role(
        id=master_role_id,
        name="master",
        description="Master role with full access",
    )
    
    db.add(master_role)
    await db.flush()
    print(f"✅ Created master role")
    return master_role


async def create_admin_role(db: AsyncSession) -> Role:
    """Create admin role if it doesn't exist."""
    admin_role_id = UUID("00000000-0000-0000-0000-000000000002")
    
    result = await db.execute(
        select(Role).where(Role.id == admin_role_id)
    )
    existing_role = result.scalar_one_or_none()
    
    if existing_role:
        print(f"✅ Role 'admin' already exists")
        return existing_role
    
    admin_role = Role(
        id=admin_role_id,
        name="admin",
        description="Admin role with administrative access",
    )
    
    db.add(admin_role)
    await db.flush()
    print(f"✅ Created admin role")
    return admin_role


async def create_default_tenant(db: AsyncSession) -> Tenant:
    """Create default tenant if it doesn't exist."""
    default_tenant_id = UUID("00000000-0000-0000-0000-000000000001")
    
    result = await db.execute(
        select(Tenant).where(Tenant.id == default_tenant_id)
    )
    existing_tenant = result.scalar_one_or_none()
    
    if existing_tenant:
        print(f"✅ Default tenant already exists")
        return existing_tenant
    
    default_tenant = Tenant(
        id=default_tenant_id,
        name="Hospital Principal",
        slug="hospital-principal",
        is_active=True,
    )
    
    db.add(default_tenant)
    await db.flush()
    print(f"✅ Created default tenant: Hospital Principal")
    return default_tenant


async def create_admin_user(db: AsyncSession, role: Role, tenant: Tenant) -> User:
    """Create admin user if it doesn't exist."""
    admin_email = "admin@hospital.com"
    
    result = await db.execute(
        select(User).where(User.email == admin_email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        print(f"✅ Admin user already exists: {admin_email}")
        return existing_user
    
    admin_user = User(
        email=admin_email,
        hashed_password=get_password_hash("1234@senha"),
        full_name="Admin Hospital",
        role_id=role.id,
        tenant_id=tenant.id,
        is_active=True,
        is_verified=True,
    )
    
    db.add(admin_user)
    await db.flush()
    print(f"✅ Created admin user: {admin_email} (password: 1234@senha)")
    return admin_user


async def init_database():
    """Initialize database with all required data."""
    print("=" * 50)
    print("🚀 Database Initialization Starting...")
    print("=" * 50)
    
    # Run migrations first
    await run_migrations()
    
    # Check if tables exist after migration
    tables_exist = await check_tables_exist()
    if not tables_exist:
        print("❌ Tables do not exist. Please check migrations.")
        return
    
    # Create seed data
    async with AsyncSessionLocal() as db:
        try:
            # Create roles
            master_role = await create_master_role(db)
            admin_role = await create_admin_role(db)
            
            # Create default tenant
            default_tenant = await create_default_tenant(db)
            
            # Create admin user with master role
            await create_admin_user(db, master_role, default_tenant)
            
            await db.commit()
            print("=" * 50)
            print("✅ Database initialization completed successfully!")
            print("=" * 50)
            print("")
            print("📋 Default credentials:")
            print("   Email: admin@hospital.com")
            print("   Password: 1234@senha")
            print("")
        except Exception as e:
            await db.rollback()
            print(f"❌ Error during initialization: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(init_database())
