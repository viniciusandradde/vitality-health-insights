#!/bin/bash
# Script para executar migrações e inicializar banco de dados

set -e

echo "🔧 Executando migrações do banco de dados..."

# Executar migrações
docker exec vsa_backend_dev python -m alembic upgrade head

echo "✅ Migrações executadas com sucesso!"
echo ""
echo "🔧 Inicializando dados do banco (roles, tenant, usuário admin)..."

# Executar script de inicialização
docker exec vsa_backend_dev python -m app.scripts.init_database

echo ""
echo "✅ Banco de dados inicializado!"
echo ""
echo "📋 Credenciais padrão:"
echo "   Email: admin@hospital.com"
echo "   Password: 1234@senha"
echo ""
echo "🔄 Reiniciando backend para aplicar mudanças..."
docker-compose -f docker/docker-compose.dev.yml restart backend

echo ""
echo "✅ Concluído! Tente fazer login novamente."
