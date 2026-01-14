.PHONY: help start stop restart logs ps build clean db redis

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Inicia PostgreSQL e Redis (apenas infraestrutura - RÁPIDO)
	@echo "🚀 Iniciando serviços de infraestrutura..."
	@export COMPOSE_HTTP_TIMEOUT=300 && \
	docker-compose -f docker-compose.infrastructure.yml up -d
	@echo "⏳ Aguardando serviços..."
	@sleep 5
	@docker-compose -f docker-compose.infrastructure.yml ps

start-all: ## Inicia todos os serviços (pode demorar no primeiro build)
	@echo "🚀 Iniciando todos os serviços..."
	@export COMPOSE_HTTP_TIMEOUT=300 && \
	docker-compose -f docker-compose.dev.yml up -d
	@docker-compose -f docker-compose.dev.yml ps

stop: ## Para todos os serviços
	@echo "🛑 Parando serviços..."
	@docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@docker-compose -f docker-compose.infrastructure.yml down 2>/dev/null || true

restart: ## Reinicia serviços
	@echo "🔄 Reiniciando serviços..."
	docker-compose -f docker-compose.dev.yml restart

logs: ## Mostra logs (use: make logs SERVICE=backend)
	@docker-compose -f docker-compose.dev.yml logs -f $(SERVICE)

ps: ## Lista serviços
	@docker-compose -f docker-compose.dev.yml ps

build: ## Reconstrói imagens
	@echo "🔨 Construindo imagens..."
	docker-compose -f docker-compose.dev.yml build --no-cache

clean: ## Remove containers e volumes (CUIDADO: apaga dados)
	@echo "🧹 Limpando..."
	docker-compose -f docker-compose.dev.yml down -v

db: ## Acessa PostgreSQL CLI
	@docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics

redis: ## Acessa Redis CLI
	@docker exec -it vsa_redis_dev redis-cli

up: ## Inicia todos os serviços (backend + frontend)
	@docker-compose -f docker-compose.dev.yml up

up-d: ## Inicia todos os serviços em background
	@docker-compose -f docker-compose.dev.yml up -d
