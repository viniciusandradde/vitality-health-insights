# 🧪 Testando Banco de Dados

## Scripts Disponíveis

### 1. Teste Completo de Conexão

```bash
# Testar banco de dados
./scripts/test-database.sh

# Ou usando o script principal
./scripts/dev-docker.sh vsa_analytics
```

**O que testa:**
- ✅ Se PostgreSQL está respondendo
- ✅ Conexão com banco de dados
- ✅ Versão do PostgreSQL
- ✅ Databases disponíveis
- ✅ Tabelas existentes
- ✅ Conexão do backend (se rodando)

### 2. Executar Queries SQL

```bash
# Executar query SQL
./scripts/db-query.sh "SELECT version();"
./scripts/db-query.sh "SELECT COUNT(*) FROM information_schema.tables;"

# Comandos PostgreSQL
./scripts/db-query.sh "\dt"  # Listar tabelas
./scripts/db-query.sh "\l"   # Listar databases
./scripts/db-query.sh "\du"  # Listar usuários
```

### 3. Acessar PostgreSQL CLI

```bash
# Usando script
./scripts/dev-docker.sh db

# Direto
docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics
# ou com sudo
sudo docker exec -it vsa_postgres_dev psql -U vsa_user -d vsa_analytics
```

## Testes Manuais

### Verificar Status do Container

```bash
docker ps | grep postgres
# ou
sudo docker ps | grep postgres
```

### Ver Logs

```bash
docker logs vsa_postgres_dev
# ou
sudo docker logs vsa_postgres_dev
```

### Testar Conexão

```bash
docker exec vsa_postgres_dev pg_isready -U vsa_user
# ou
sudo docker exec vsa_postgres_dev pg_isready -U vsa_user
```

### Informações do Banco

```bash
# Versão
docker exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "SELECT version();"

# Databases
docker exec vsa_postgres_dev psql -U vsa_user -c "\l"

# Tabelas
docker exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "\dt"

# Tamanho do banco
docker exec vsa_postgres_dev psql -U vsa_user -d vsa_analytics -c "SELECT pg_size_pretty(pg_database_size('vsa_analytics'));"
```

## Testar do Backend

### Python (dentro do container)

```bash
# Teste simples
docker exec -it vsa_backend_dev python -c "
from app.core.database import AsyncSessionLocal
from sqlalchemy import text
import asyncio

async def test():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text('SELECT 1'))
        print('✅ Conexão OK')

asyncio.run(test())
"

# Ou usar o script dedicado
./scripts/test-backend-connection.sh
```

### Via API (se backend estiver rodando)

```bash
# Health check
curl http://localhost:8000/health

# Verificar se API responde
curl http://localhost:8000/
```

## Troubleshooting

### Container não está rodando

```bash
# Iniciar
./scripts/dev-docker.sh start
# ou
docker-compose -f docker/docker-compose.dev.yml up -d postgres
```

### Erro de permissão

```bash
# Usar sudo
sudo ./scripts/test-database.sh
# ou adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# (fazer logout/login)
```

### Erro de conexão

```bash
# Verificar se porta está correta
# Padrão: 5433 (se PostgreSQL local estiver na 5432)

# Verificar variáveis de ambiente
cat docker/.env | grep POSTGRES_PORT

# Testar conexão direta
psql -h localhost -p 5433 -U vsa_user -d vsa_analytics
```

## Informações de Conexão

- **Host**: localhost (do host) ou postgres (dentro do Docker)
- **Porta**: 5433 (padrão, configurável via POSTGRES_PORT)
- **Database**: vsa_analytics
- **Usuário**: vsa_user
- **Senha**: Definida em docker/.env (DB_PASSWORD)

## Próximos Passos

Após confirmar que o banco está funcionando:

1. Executar migrações:
   ```bash
   cd apps/backend
   source venv/bin/activate
   alembic upgrade head
   ```

2. Criar dados iniciais (se necessário)

3. Testar rotas da API que usam banco de dados
