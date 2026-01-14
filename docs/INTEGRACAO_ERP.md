# Integração ERP - Anti-Corruption Layer

Este documento descreve a implementação da integração com ERPs legados usando o padrão Anti-Corruption Layer (ACL).

## Visão Geral

A integração ERP foi implementada seguindo o padrão Anti-Corruption Layer, isolando completamente o domínio do ERP do domínio interno do sistema. Isso garante que:

- O sistema não fica acoplado à estrutura do ERP
- Mudanças no ERP não afetam o código interno
- Dados do ERP são traduzidos para o domínio interno
- Conexões são read-only e seguras

## Arquitetura

```
Frontend
    ↓
API Routes (/api/v1/integrations/erp/*)
    ↓
ERPService (orquestração)
    ↓
ERPRepository (execução de queries)
    ↓
ERPClient (conexão read-only)
    ↓
ERP Database (PostgreSQL, SQL Server, etc.)
```

### Componentes

1. **Config** (`config.py`): Gerencia configurações de conexão por tenant
2. **Client** (`client.py`): Cliente SQLAlchemy read-only com validação
3. **Repository** (`repository.py`): Executa queries SQL de forma segura
4. **Mappers** (`mappers.py`): Traduz dados do ERP para domínio interno
5. **Service** (`service.py`): Orquestra operações, cache e rate limiting
6. **Cache** (`cache.py`): Cache com Redis
7. **Queries** (`queries/*.sql`): Queries SQL isoladas por domínio

## Configuração

### 1. Criar Integração no Sistema

Acesse `/api/v1/settings/integracoes` e crie uma nova integração com:

```json
{
  "nome": "ERP Hospital Principal",
  "tipo": "erp",
  "ativo": true,
  "config": {
    "erp_type": "postgresql",
    "erp_host": "192.168.1.100",
    "erp_port": 5432,
    "erp_database_name": "erp_hospital",
    "erp_username": "erp_readonly",
    "erp_password": "senha_segura",
    "erp_ssl_mode": "prefer",
    "erp_timeout_seconds": 30,
    "erp_max_connections": 5,
    "erp_enabled": true
  }
}
```

### 2. Estrutura do Config JSON

O campo `config` deve conter:

- `erp_type`: Tipo de banco (`postgresql`, `sqlserver`, `oracle`, `mysql`)
- `erp_host`: Host do banco do ERP
- `erp_port`: Porta do banco
- `erp_database_name`: Nome do banco de dados
- `erp_username`: Usuário (será criptografado)
- `erp_password`: Senha (será criptografada)
- `erp_ssl_mode`: Modo SSL (para PostgreSQL: `disable`, `allow`, `prefer`, `require`)
- `erp_timeout_seconds`: Timeout em segundos (padrão: 30)
- `erp_max_connections`: Máximo de conexões no pool (padrão: 5)
- `erp_enabled`: Habilitar/desabilitar integração

## Queries SQL

As queries SQL estão em `apps/backend/app/integrations/erp/queries/`:

- `pacientes.sql`: Buscar pacientes
- `atendimentos.sql`: Buscar atendimentos
- `faturamento.sql`: Buscar faturamento
- `estoque.sql`: Buscar estoque
- `internacoes.sql`: Buscar internações

### Ajustando Queries para seu ERP

Cada arquivo SQL é um template que deve ser ajustado conforme a estrutura real do seu ERP:

1. **Ajustar nomes de tabelas**: Substituir `cad_pacientes`, `atendimentos`, etc.
2. **Ajustar nomes de colunas**: Verificar nomes reais das colunas
3. **Ajustar condições**: Adaptar WHERE clauses conforme necessário
4. **Adicionar JOINs**: Incluir JOINs necessários

Exemplo de ajuste:

```sql
-- Original (template)
SELECT codigo, nome, cpf
FROM cad_pacientes
WHERE deleted_at IS NULL;

-- Ajustado para ERP específico
SELECT cod_paciente, nome_completo, cpf_cnpj
FROM pacientes
WHERE ativo = 'S';
```

## Endpoints API

### Health Check

```http
GET /api/v1/integrations/erp/health
```

Verifica se a conexão com o ERP está funcionando.

**Response:**
```json
{
  "connected": true,
  "erp_type": "postgresql",
  "database": "erp_hospital",
  "message": "Connected"
}
```

### Pacientes

```http
GET /api/v1/integrations/erp/pacientes?limit=20&offset=0
```

Lista pacientes do ERP.

**Query Parameters:**
- `limit`: Número de registros (padrão: 20, máximo: 1000)
- `offset`: Registros a pular (padrão: 0)

### Atendimentos

```http
GET /api/v1/integrations/erp/atendimentos?data_inicio=2024-01-01&data_fim=2024-01-31&limit=20&offset=0
```

Lista atendimentos do ERP em um período.

**Query Parameters:**
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)
- `limit`: Número de registros
- `offset`: Registros a pular

### Faturamento

```http
GET /api/v1/integrations/erp/faturamento?data_inicio=2024-01-01&data_fim=2024-01-31&limit=20&offset=0
```

Lista faturamento do ERP em um período.

### Estoque

```http
GET /api/v1/integrations/erp/estoque?categoria=MEDICAMENTOS&limit=20&offset=0
```

Lista itens de estoque do ERP.

**Query Parameters:**
- `categoria`: Filtrar por categoria (opcional)
- `limit`: Número de registros
- `offset`: Registros a pular

### Internações

```http
GET /api/v1/integrations/erp/internacoes?data_inicio=2024-01-01&data_fim=2024-01-31&limit=20&offset=0
```

Lista internações do ERP em um período.

### Invalidar Cache

```http
POST /api/v1/integrations/erp/cache/invalidate?domain=pacientes
```

Invalida o cache do ERP. Se `domain` não for especificado, invalida todo o cache do tenant.

## Segurança

### Read-Only

- Todas as queries são validadas para garantir que são apenas SELECT
- Keywords proibidas: INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, etc.
- Conexões são configuradas como read-only no banco

### Credenciais

- Credenciais são armazenadas no campo `config` do modelo `Integracao`
- Em produção, devem ser criptografadas antes de salvar
- Cada tenant tem suas próprias credenciais

### Rate Limiting

- Limite de 60 queries por minuto por tenant
- Exceder o limite retorna HTTP 429 (Too Many Requests)
- Rate limit é aplicado antes de executar queries no ERP

### Isolamento

- Conexões separadas por tenant
- Cache separado por tenant
- Dados isolados por tenant_id

## Performance

### Cache

Cache automático com Redis:

- **Pacientes**: 1 hora (3600s)
- **Atendimentos**: 30 minutos (1800s)
- **Faturamento**: 30 minutos (1800s)
- **Estoque**: 1 hora (3600s)
- **Internações**: 30 minutos (1800s)

Chaves de cache: `erp:{tenant_id}:{domain}:{params_hash}`

### Pool de Conexões

- Pool configurável por tenant (padrão: 5 conexões)
- Connection pooling para reutilização
- Health check automático (pool_pre_ping)

### Timeout

- Timeout configurável por query (padrão: 30 segundos)
- Timeout aplicado na conexão e na query

## Mapeamento de Dados

Os dados do ERP são mapeados para o domínio interno através dos mappers:

- **PacienteMapper**: Mapeia dados de pacientes
- **AtendimentoMapper**: Mapeia dados de atendimentos
- **FaturamentoMapper**: Mapeia dados de faturamento
- **EstoqueMapper**: Mapeia dados de estoque
- **InternacaoMapper**: Mapeia dados de internações

### Normalização

Os mappers normalizam:

- **Datas**: Convertidas para ISO format (YYYY-MM-DDTHH:MM:SS)
- **Strings**: Trimmed e limitadas ao tamanho máximo
- **Decimais**: Convertidos para float
- **Inteiros**: Convertidos para int
- **Valores nulos**: Tratados apropriadamente

## Troubleshooting

### Erro: "ERP integration not configured"

A integração não foi configurada para o tenant. Configure em `/api/v1/settings/integracoes`.

### Erro: "Rate limit exceeded"

Muitas queries em pouco tempo. Aguarde 1 minuto ou aumente o limite em `service.py`.

### Erro: "Connection failed"

Verifique:
- Credenciais estão corretas
- Host e porta estão acessíveis
- Firewall permite conexão
- Banco está rodando

### Erro: "Query timeout"

Query demorou mais que o timeout configurado. Aumente `erp_timeout_seconds` ou otimize a query.

### Cache não está funcionando

Verifique:
- Redis está rodando
- `REDIS_URL` está configurado corretamente
- Conexão com Redis está funcionando

## Exemplos de Uso

### Python (requests)

```python
import requests

# Health check
response = requests.get(
    "http://localhost:8000/api/v1/integrations/erp/health",
    headers={"Authorization": "Bearer <token>"}
)
print(response.json())

# Buscar pacientes
response = requests.get(
    "http://localhost:8000/api/v1/integrations/erp/pacientes",
    headers={"Authorization": "Bearer <token>"},
    params={"limit": 50}
)
pacientes = response.json()["items"]
```

### cURL

```bash
# Health check
curl -X GET "http://localhost:8000/api/v1/integrations/erp/health" \
  -H "Authorization: Bearer <token>"

# Buscar atendimentos
curl -X GET "http://localhost:8000/api/v1/integrations/erp/atendimentos?data_inicio=2024-01-01&data_fim=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

## Próximos Passos

1. **Criptografia de credenciais**: Implementar criptografia antes de salvar
2. **Sincronização automática**: Agendar sincronização periódica
3. **Webhooks**: Notificar quando dados mudarem no ERP
4. **Suporte a outros bancos**: Adicionar SQL Server, Oracle, MySQL
5. **Métricas**: Adicionar métricas de performance e uso

## Notas Importantes

- As queries SQL são templates e devem ser ajustadas para cada ERP
- Credenciais devem ser criptografadas em produção
- Rate limiting protege o ERP de sobrecarga
- Cache reduz carga no ERP e melhora performance
- Todas as queries são validadas para serem read-only
