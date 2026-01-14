#!/bin/bash

# Script para gerenciar ambiente Docker de desenvolvimento

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$PROJECT_ROOT"

case "$1" in
  start)
    echo "🚀 Iniciando ambiente de desenvolvimento..."
    echo "📦 Iniciando apenas infraestrutura (PostgreSQL + Redis)..."
    docker-compose -f "$DOCKER_DIR/docker-compose.infrastructure.yml" up -d
    echo "⏳ Aguardando serviços ficarem prontos..."
    sleep 5
    docker-compose -f "$DOCKER_DIR/docker-compose.infrastructure.yml" ps
    echo "✅ Serviços iniciados!"
    echo ""
    echo "💡 Dica: Para iniciar backend e frontend, use desenvolvimento local:"
    echo "  Terminal 1: pnpm dev:backend"
    echo "  Terminal 2: pnpm dev:frontend"
    echo ""
    echo "Ou inicie tudo no Docker (pode demorar no primeiro build):"
    echo "  docker-compose -f $DOCKER_DIR/docker-compose.dev.yml up backend frontend"
    ;;
  
  start-infra)
    echo "🚀 Iniciando apenas infraestrutura..."
    docker-compose -f "$DOCKER_DIR/docker-compose.infrastructure.yml" up -d
    docker-compose -f "$DOCKER_DIR/docker-compose.infrastructure.yml" ps
    ;;
  
  start-all)
    echo "🚀 Iniciando todos os serviços (pode demorar no primeiro build)..."
    export COMPOSE_HTTP_TIMEOUT=300
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" up -d
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" ps
    ;;
  
  stop)
    echo "🛑 Parando serviços..."
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" down 2>/dev/null || true
    docker-compose -f "$DOCKER_DIR/docker-compose.infrastructure.yml" down 2>/dev/null || true
    echo "✅ Serviços parados!"
    ;;
  
  restart)
    echo "🔄 Reiniciando serviços..."
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" restart
    ;;
  
  logs)
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" logs -f "${2:-}"
    ;;
  
  ps)
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" ps
    ;;
  
  build)
    echo "🔨 Construindo imagens..."
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" build --no-cache
    echo "✅ Imagens construídas!"
    ;;
  
  clean)
    echo "🧹 Limpando containers e volumes..."
    read -p "Tem certeza que deseja remover volumes? (dados serão perdidos) [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      "$SCRIPT_DIR/clean-docker.sh"
    else
      echo "❌ Operação cancelada."
    fi
    ;;
  
  reset)
    echo "🔄 Reset completo (limpar e reiniciar)..."
    "$SCRIPT_DIR/clean-docker.sh"
    sleep 2
    "$SCRIPT_DIR/dev-docker.sh" start
    ;;
  
  db)
    echo "🗄️  Acessando banco de dados..."
    docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics
    ;;
  
  redis)
    echo "🔴 Acessando Redis CLI..."
    docker exec -it vsa_redis_dev redis-cli
    ;;
  
  *)
    echo "Uso: $0 {start|start-infra|start-all|stop|restart|logs|ps|build|clean|reset|db|redis}"
    echo ""
    echo "Comandos:"
    echo "  start       - Inicia apenas infraestrutura (PostgreSQL + Redis) - RÁPIDO"
    echo "  start-infra - Mesmo que start (apenas infraestrutura)"
    echo "  start-all   - Inicia tudo incluindo backend/frontend (pode demorar)"
    echo "  stop        - Para todos os serviços"
    echo "  restart     - Reinicia serviços"
    echo "  logs        - Mostra logs (adicione nome do serviço para filtrar)"
    echo "  ps          - Lista serviços"
    echo "  build       - Reconstrói imagens"
    echo "  clean       - Remove containers e volumes"
    echo "  reset       - Limpa tudo e reinicia"
    echo "  db          - Acessa PostgreSQL CLI"
    echo "  redis       - Acessa Redis CLI"
    exit 1
    ;;
esac
