#!/usr/bin/env python3
"""Script para criar dados iniciais (seeds) no banco de dados."""

import asyncio
import sys
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Adicionar o diretório raiz ao path
sys.path.insert(0, ".")

from app.core.config import settings
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash password usando bcrypt diretamente."""
    # Gerar salt e hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')
from app.models.tenant import Tenant
from app.models.user import Role, User
from app.models.subscription import Plan, Subscription


async def create_seeds():
    """Criar dados iniciais."""
    # Criar engine
    engine = create_async_engine(
        settings.database_url_async,
        echo=False,
    )

    # Criar session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        print("🌱 Criando seeds...")
        print("")

        # 1. Criar Roles
        print("1. Criando roles...")
        roles_data = [
            {"name": "master_admin", "description": "Administrador Master"},
            {"name": "tenant_admin", "description": "Administrador do Tenant"},
            {"name": "manager", "description": "Gerente"},
            {"name": "analyst", "description": "Analista"},
            {"name": "viewer", "description": "Visualizador"},
        ]

        roles = {}
        for role_data in roles_data:
            result = await session.execute(
                select(Role).where(Role.name == role_data["name"])
            )
            role = result.scalar_one_or_none()
            if not role:
                role = Role(**role_data)
                session.add(role)
                await session.flush()
                print(f"   ✅ Role '{role_data['name']}' criada")
            else:
                print(f"   ⏭️  Role '{role_data['name']}' já existe")
            roles[role_data["name"]] = role

        await session.commit()
        print("")

        # 2. Criar Planos
        print("2. Criando planos...")
        plans_data = [
            {
                "name": "Free",
                "description": "Plano gratuito com funcionalidades básicas",
                "price_monthly": 0.00,
                "max_users": 5,
                "max_api_calls": 1000,
                "max_storage_gb": 1,
            },
            {
                "name": "Starter",
                "description": "Plano inicial para pequenos hospitais",
                "price_monthly": 299.00,
                "max_users": 20,
                "max_api_calls": 10000,
                "max_storage_gb": 10,
            },
            {
                "name": "Professional",
                "description": "Plano profissional para hospitais médios",
                "price_monthly": 999.00,
                "max_users": 100,
                "max_api_calls": 100000,
                "max_storage_gb": 100,
            },
            {
                "name": "Enterprise",
                "description": "Plano enterprise para grandes hospitais",
                "price_monthly": 2999.00,
                "max_users": 500,
                "max_api_calls": 1000000,
                "max_storage_gb": 1000,
            },
        ]

        plans = {}
        for plan_data in plans_data:
            result = await session.execute(
                select(Plan).where(Plan.name == plan_data["name"])
            )
            plan = result.scalar_one_or_none()
            if not plan:
                plan = Plan(**plan_data, is_active=True)
                session.add(plan)
                await session.flush()
                print(f"   ✅ Plano '{plan_data['name']}' criado")
            else:
                print(f"   ⏭️  Plano '{plan_data['name']}' já existe")
            plans[plan_data["name"]] = plan

        await session.commit()
        print("")

        # 3. Criar Tenant de Teste
        print("3. Criando tenant de teste...")
        result = await session.execute(
            select(Tenant).where(Tenant.slug == "hospital-teste")
        )
        tenant = result.scalar_one_or_none()

        if not tenant:
            tenant = Tenant(
                name="Hospital de Teste",
                slug="hospital-teste",
                logo_url=None,
                primary_color="#3B82F6",
                timezone="America/Sao_Paulo",
                language="pt-BR",
                modules_enabled=[],
                max_users=100,
                data_retention_days=365,
                address_city="São Paulo",
                address_state="SP",
                address_country="Brasil",
                cnpj="12.345.678/0001-90",
                phone="(11) 1234-5678",
                email="contato@hospital-teste.com.br",
                is_active=True,
            )
            session.add(tenant)
            await session.flush()
            print("   ✅ Tenant 'Hospital de Teste' criado")
        else:
            print("   ⏭️  Tenant 'Hospital de Teste' já existe")

        await session.commit()
        print("")

        # 4. Criar Subscription para o Tenant
        print("4. Criando subscription...")
        result = await session.execute(
            select(Subscription).where(Subscription.tenant_id == tenant.id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            from datetime import timezone
            start_date = datetime.now(timezone.utc)
            end_date = start_date + timedelta(days=30)

            subscription = Subscription(
                tenant_id=tenant.id,
                plan_id=plans["Professional"].id,
                status="active",
                current_period_start=start_date.isoformat(),
                current_period_end=end_date.isoformat(),
                price_monthly=plans["Professional"].price_monthly,
            )
            session.add(subscription)
            await session.flush()
            print("   ✅ Subscription criada")
        else:
            print("   ⏭️  Subscription já existe")

        await session.commit()
        print("")

        # 5. Criar Usuário Admin
        print("5. Criando usuário admin...")
        result = await session.execute(
            select(User).where(User.email == "admin@hospital-teste.com.br")
        )
        admin_user = result.scalar_one_or_none()

        if not admin_user:
            admin_user = User(
                email="admin@hospital-teste.com.br",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrador",
                tenant_id=tenant.id,
                role_id=roles["tenant_admin"].id,
                is_active=True,
                is_verified=True,
            )
            session.add(admin_user)
            await session.flush()
            print("   ✅ Usuário admin criado")
            print("      Email: admin@hospital-teste.com.br")
            print("      Senha: admin123")
        else:
            print("   ⏭️  Usuário admin já existe")

        await session.commit()
        print("")

        print("✅ Seeds criados com sucesso!")
        print("")
        print("📋 Credenciais de acesso:")
        print("   Email: admin@hospital-teste.com.br")
        print("   Senha: admin123")
        print("   Tenant: hospital-teste")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_seeds())
