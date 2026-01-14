#!/bin/bash

# Script para corrigir erro ContainerConfig

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$PROJECT_ROOT"

SERVICE="${1:-backend}"

echo "🔧 Corrigindo erro ContainerConfig para: $SERVICE"

# Parar e remover container específico
echo "🛑 Parando e removendo container $SERVICE..."
docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" stop "$SERVICE" 2>/dev/null || true
docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" rm -f "$SERVICE" 2>/dev/null || true

# Remover container manualmente se ainda existir
CONTAINER_NAME="vsa_${SERVICE}_dev"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Remover containers órfãos com mesmo nome
docker ps -a --format "{{.ID}} {{.Names}}" | grep "$CONTAINER_NAME" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

echo "🔨 Rebuild do $SERVICE..."
export COMPOSE_HTTP_TIMEOUT=300
docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" build --no-cache "$SERVICE"

echo "🚀 Iniciando $SERVICE..."
docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" up -d "$SERVICE"

echo "✅ Container $SERVICE corrigido e reiniciado!"
echo ""
echo "Verificar logs:"
echo "  docker-compose -f $DOCKER_DIR/docker-compose.dev.yml logs -f $SERVICE"
