#!/bin/bash

# Script para limpar containers e volumes Docker

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$PROJECT_ROOT"

echo "🧹 Limpando containers e volumes Docker..."

# Parar e remover containers
echo "📦 Parando containers..."
docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" down -v 2>/dev/null || true

# Remover containers órfãos
echo "🗑️  Removendo containers órfãos..."
docker rm -f vsa_postgres_dev vsa_redis_dev vsa_backend_dev vsa_frontend_dev 2>/dev/null || true

# Remover containers com IDs parciais (pode causar erro ContainerConfig)
echo "🔍 Removendo containers com problemas de configuração..."
docker ps -a --format "{{.ID}} {{.Names}}" | grep -E "vsa_backend|vsa_frontend" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

# Remover volumes órfãos (apenas do projeto)
echo "💾 Removendo volumes do projeto..."
docker volume rm postgres_dev_data redis_dev_data backend_venv frontend_node_modules 2>/dev/null || true

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "Agora você pode iniciar os serviços novamente:"
echo "  ./scripts/dev-docker.sh start"
echo "  # ou"
echo "  docker-compose -f docker/docker-compose.dev.yml up -d postgres redis"
