# 🚀 Guia Rápido - VSA Analytics Health

## Início Rápido com Docker

### 0. Resolver conflitos de porta (se necessário)

Se a porta 5432 estiver em uso (PostgreSQL local), use porta alternativa:

```bash
# Criar arquivo .env com porta alternativa
echo "POSTGRES_PORT=5433" > docker/.env
echo "DB_PASSWORD=vsa_dev_password" >> docker/.env

# OU usar variável de ambiente
export POSTGRES_PORT=5433
```

**Importante**: Se usar porta 5433, atualize `apps/backend/.env`:
```
DATABASE_URL=postgresql://vsa_user:vsa_dev_password@localhost:5433/vsa_analytics
```

### 1. Iniciar serviços de infraestrutura (PostgreSQL + Redis)

**Recomendado**: Iniciar apenas infraestrutura no Docker e rodar apps localmente (mais rápido)

```bash
# Opção 1: Usando script (RECOMENDADO - mais rápido)
./scripts/dev-docker.sh start

# Opção 2: Usando docker-compose apenas infraestrutura
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# Opção 3: Usando Makefile
cd docker && make start

# Opção 4: Tudo no Docker (pode demorar no primeiro build)
export COMPOSE_HTTP_TIMEOUT=300
./scripts/dev-docker.sh start-all
```

### 2. Configurar variáveis de ambiente (opcional)

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Ajustar DATABASE_URL se necessário
# DATABASE_URL=postgresql://vsa_user:vsa_dev_password@localhost:5432/vsa_analytics
```

### 3. Executar migrações do banco (primeira vez)

```bash
cd apps/backend
source venv/bin/activate
alembic upgrade head
```

### 4. Iniciar aplicações

#### Opção A: Tudo no Docker (recomendado para desenvolvimento)

```bash
# Iniciar backend e frontend no Docker
docker-compose -f docker/docker-compose.dev.yml up backend frontend
```

#### Opção B: Desenvolvimento local (banco no Docker, apps localmente)

**Terminal 1 - Backend:**
```bash
cd apps/backend
source venv/bin/activate
pnpm dev:backend
# ou
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
pnpm dev
```

### 5. Acessar aplicações

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Comandos Úteis

### Docker

```bash
# Ver status dos serviços
./scripts/dev-docker.sh ps
# ou
cd docker && make ps

# Ver logs
./scripts/dev-docker.sh logs
./scripts/dev-docker.sh logs backend
./scripts/dev-docker.sh logs frontend

# Parar serviços
./scripts/dev-docker.sh stop

# Acessar banco de dados
./scripts/dev-docker.sh db

# Acessar Redis
./scripts/dev-docker.sh redis
```

### Desenvolvimento

```bash
# Iniciar tudo (Turborepo)
pnpm dev

# Apenas frontend
pnpm dev:frontend

# Apenas backend
pnpm dev:backend

# Build
pnpm build

# Lint
pnpm lint

# Typecheck
pnpm typecheck
```

## Estrutura do Projeto

```
vsa-analytics-health-full/
├── apps/
│   ├── frontend/          # React + Vite
│   └── backend/           # FastAPI
├── docker/
│   ├── docker-compose.yml          # Produção
│   ├── docker-compose.dev.yml      # Desenvolvimento
│   └── README.md
├── scripts/
│   └── dev-docker.sh       # Scripts de gerenciamento
└── package.json           # Scripts do monorepo
```

## Troubleshooting

### Permissão negada no Docker

Se você receber `Permission denied` ao usar Docker:

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças (fazer logout/login ou usar):
newgrp docker

# Verificar se funcionou
docker ps
```

**Documentação completa**: Veja `docker/TROUBLESHOOTING.md`

### Timeout ao iniciar containers

Se você receber `Read timed out` ou `HTTP request took too long`:

```bash
# Solução 1: Aumentar timeout e usar apenas infraestrutura (RECOMENDADO)
export COMPOSE_HTTP_TIMEOUT=300
./scripts/dev-docker.sh start  # Apenas PostgreSQL + Redis

# Solução 2: Iniciar tudo com timeout aumentado
export COMPOSE_HTTP_TIMEOUT=300
docker-compose -f docker/docker-compose.dev.yml up -d

# Solução 3: Usar docker-compose apenas para infraestrutura
docker-compose -f docker/docker-compose.infrastructure.yml up -d
```

**Dica**: Para desenvolvimento, é mais rápido iniciar apenas PostgreSQL + Redis no Docker e rodar backend/frontend localmente.

### Porta já em uso

```bash
# Verificar portas
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Parar processos
kill -9 <PID>
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs
docker logs vsa_postgres_dev

# Testar conexão
docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "SELECT 1;"
```

### Rebuild containers

```bash
# Rebuild tudo
./scripts/dev-docker.sh build

# Rebuild específico
docker-compose -f docker/docker-compose.dev.yml build --no-cache backend
```

### Limpar tudo e recomeçar

```bash
# CUIDADO: Remove todos os dados
./scripts/dev-docker.sh clean
./scripts/dev-docker.sh start
```

## Próximos Passos

1. ✅ Ambiente Docker configurado
2. ✅ Banco de dados rodando
3. ⏭️ Executar migrações
4. ⏭️ Criar usuário admin inicial
5. ⏭️ Testar autenticação
6. ⏭️ Integrar frontend com backend
