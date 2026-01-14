# Docker Setup - VSA Analytics Health

## Estrutura Docker

Este diretório contém as configurações Docker para desenvolvimento e produção.

### Arquivos

- `docker-compose.yml` - Configuração para produção/staging
- `docker-compose.dev.yml` - Configuração para desenvolvimento com hot-reload
- `.env.example` - Exemplo de variáveis de ambiente

## Desenvolvimento

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas 3000, 5432, 6379 e 8000 disponíveis

### Iniciar ambiente de desenvolvimento

```bash
# 1. Copiar arquivo de ambiente (se necessário)
cp .env.example .env

# 2. Iniciar serviços (PostgreSQL e Redis)
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 3. Aguardar serviços ficarem prontos
docker-compose -f docker-compose.dev.yml ps

# 4. Executar migrações do banco (se necessário)
cd apps/backend
source venv/bin/activate
alembic upgrade head

# 5. Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up
```

### Comandos úteis

```bash
# Iniciar apenas banco e Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache

# Acessar banco de dados
docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics

# Acessar Redis CLI
docker exec -it vsa_redis_dev redis-cli
```

## Serviços

### PostgreSQL
- **Porta**: 5432
- **Usuário**: vsa_user
- **Senha**: Definida em `.env` (DB_PASSWORD)
- **Database**: vsa_analytics

### Redis
- **Porta**: 6379
- **Sem autenticação** (apenas em desenvolvimento)

### Backend (FastAPI)
- **Porta**: 8000
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Hot-reload**: Habilitado em desenvolvimento

### Frontend (Vite)
- **Porta**: 3000
- **URL**: http://localhost:3000
- **Hot-reload**: Habilitado em desenvolvimento

## Desenvolvimento Local (sem Docker)

Se preferir rodar localmente sem Docker:

```bash
# 1. Iniciar apenas banco e Redis no Docker
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 2. Backend (em outro terminal)
cd apps/backend
source venv/bin/activate
pnpm dev:backend

# 3. Frontend (em outro terminal)
cd apps/frontend
pnpm dev
```

## Produção

Para produção, use `docker-compose.yml`:

```bash
docker-compose -f docker-compose.yml up -d
```
