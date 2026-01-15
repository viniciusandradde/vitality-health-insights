"""Script to create master role if it doesn't exist."""
import asyncio
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.user import Role


async def create_master_role():
    """Create master role if it doesn't exist."""
    async with AsyncSessionLocal() as db:
        master_role_id = UUID("00000000-0000-0000-0000-000000000001")
        
        # Check if role exists
        result = await db.execute(
            select(Role).where(Role.id == master_role_id)
        )
        existing_role = result.scalar_one_or_none()
        
        if existing_role:
            print(f"Role 'master' already exists with ID {master_role_id}")
            return
        
        # Create master role
        master_role = Role(
            id=master_role_id,
            name="master",
            description="Master role with full access",
        )
        
        db.add(master_role)
        await db.commit()
        print(f"Created master role with ID {master_role_id}")


if __name__ == "__main__":
    asyncio.run(create_master_role())
