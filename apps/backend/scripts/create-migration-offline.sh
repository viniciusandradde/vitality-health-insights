#!/bin/bash

# Script para criar migration sem conexão com banco
# Usa modo offline do Alembic

cd "$(dirname "$0")/.." || exit 1

echo "📝 Criando migration inicial (modo offline)..."

# Criar migration vazia primeiro
python -m alembic revision -m "initial_migration_all_models" || {
    echo "❌ Erro ao criar migration"
    exit 1
}

echo "✅ Migration criada!"
echo ""
echo "⚠️  IMPORTANTE: Esta migration está vazia."
echo "   Você precisará editá-la manualmente ou aplicar quando o banco estiver disponível."
echo ""
echo "Para aplicar quando o banco estiver rodando:"
echo "  python -m alembic upgrade head"
