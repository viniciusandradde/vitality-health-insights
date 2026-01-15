Integração da Stack de Agente IA + RAG

Projeto: vsa-analytics-health
Stack: FastAPI + React + PostgreSQL + pgvector + ADK + LangChain + LangGraph

🎯 1. OBJETIVO DA INTEGRAÇÃO

Adicionar ao SaaS hospitalar uma camada nativa de Inteligência Artificial corporativa, capaz de:

Responder perguntas em linguagem natural

Consultar dados assistenciais, operacionais e gerenciais

Gerar insights automáticos explicáveis

Operar em modo multi-tenant seguro

Escalar como feature premium do produto

Atender LGPD e auditoria corporativa

📌 Princípio fundamental

A IA não é um sistema externo
Ela é um subdomínio do backend atual

🧠 2. VISÃO GERAL DA ARQUITETURA
4
React (Dashboard + Chat IA)
        │
        ▼
FastAPI vsa-analytics-health
(API Principal + Auth + Tenant)
        │
        ├── Módulos Assistencial / Gerencial / Dashboard
        │
        └── IA Service Layer
             │
             ├── ADK (Agentes corporativos)
             ├── LangChain (RAG / Tools)
             ├── LangGraph (Workflows)
             ├── PostgreSQL 16 + pgvector
             └── OpenRouter / OpenAI

🧩 3. ETAPA 1 — ORGANIZAÇÃO NO MONOREPO
📁 Estrutura Final do Backend
apps/backend/app/
├── ai/                         # SUBDOMÍNIO IA
│   ├── api/                    # Rotas públicas IA
│   │   ├── chat.py             # Chat IA
│   │   ├── rag.py              # Busca e ingestão
│   │   └── agents.py           # Invocação de agentes
│   │
│   ├── agents/                 # Núcleo de agentes (ADK)
│   │   ├── base.py             # BaseAgent
│   │   ├── simple.py           # ChatAgent
│   │   └── workflow.py         # WorkflowAgent
│   │
│   ├── rag/                    # Pipeline RAG
│   │   ├── ingestion.py        # Ingestão de dados
│   │   ├── loaders.py          # Loaders SQL / MD
│   │   └── tools.py            # Ferramentas RAG
│   │
│   ├── middleware/
│   │   └── dynamic.py          # Contexto tenant-aware
│   │
│   ├── schemas/
│   │   ├── requests.py
│   │   └── responses.py
│   │
│   └── service.py              # Orquestrador IA (ADK)
│
├── api/router.py               # incluir /api/v1/ai


📌 Decisão arquitetural

IA não depende de outro backend

Não quebra contratos existentes

Pode ser desligada por feature flag

🔐 4. ETAPA 2 — MULTI-TENANCY (HERDADO DO SISTEMA)
🔑 Regra de Ouro

Toda chamada IA herda o tenant do JWT

Middleware já existente:

request.state.tenant_id
request.state.user_id


Uso dentro da IA:

config = {
  "configurable": {
    "tenant_id": request.state.tenant_id,
    "user_id": request.state.user_id,
    "empresa": tenant.nome
  }
}

🔒 Garantias

✔ Isolamento total por hospital
✔ RAG separado por tenant
✔ LGPD by design
✔ Auditoria de uso

🗄️ 5. ETAPA 3 — POSTGRESQL + PGVECTOR
📌 Extensões
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

📌 Tabelas IA (independentes)
kb_docs
Campo	Tipo
id	uuid
tenant_id	uuid
empresa	text
source	text
metadata	jsonb
created_at	timestamp
kb_chunks
Campo	Tipo
id	uuid
doc_id	uuid
tenant_id	uuid
content	text
embedding	vector(1536)
metadata	jsonb
🔍 Estratégia de Busca (Hybrid)

Vector Search (pgvector)

Full-text (GIN + trigram)

RRF (Reciprocal Rank Fusion)

📌 Ideal para:

Dashboards

Relatórios

Perguntas comparativas

Análises históricas

🤖 6. ETAPA 4 — AGENTES NO PRODUTO (CASOS DE USO)
🧠 Assistente Executivo

“Como está a ocupação de leitos hoje comparado à semana passada?”

Fluxo:

Consulta KPIs

Busca histórica

RAG contextual

Geração de insight

🏥 Assistente Assistencial

“Quais setores tiveram mais infecção hospitalar este mês?”

Fluxo:

Query em ccih_*

RAG com protocolos

Resposta explicável

💼 Assistente Gerencial

“Explique o aumento do faturamento com base nos atendimentos.”

Fluxo:

Financeiro

Atendimentos

Correlação

Narrativa gerencial

🔁 7. ETAPA 5 — RAG COM DADOS DO PRÓPRIO SISTEMA
Fonte	Estratégia
Protocolos hospitalares	Markdown
Documentação interna	Markdown
Relatórios SQL	Export + ingest
Indicadores históricos	Materialized Views

📌 Nada sai do banco
📌 Nada treina modelo externo

🔌 8. ETAPA 6 — ROTAS DE API IA

Prefixo:

/api/v1/ai

Método	Rota	Função
POST	/ai/chat	Chat IA
POST	/ai/chat/stream	Streaming SSE
POST	/ai/rag/search	Busca RAG
POST	/ai/rag/ingest	Ingestão
GET	/ai/rag/stats	Métricas
POST	/ai/agents/invoke	Executar agente

🔐 Todas protegidas por:

JWT

Tenant

Plano

🧠 9. ETAPA 7 — WORKFLOW AGENT (INTELIGÊNCIA REAL)

O WorkflowAgent decide automaticamente:

Chat simples

Busca RAG

Consulta SQL

Ação customizada

Geração de relatório

📌 Isso habilita:

Copiloto hospitalar

Insights automáticos

Alertas proativos

Automação futura

📊 10. ETAPA 8 — INTEGRAÇÃO COM FRONTEND (REACT)
Componentes sugeridos

AIChatDrawer

AskAIButton

InsightCard

ExplainThisChart

Exemplo:

<ExplainThisChart chartId="ocupacao_leitos" />


IA recebe:

ID do gráfico

Dados agregados

Contexto do módulo

🚀 11. ETAPA 9 — ROADMAP DE IMPLEMENTAÇÃO
Fase 1

Estrutura IA

pgvector

RAG básico

Fase 2

Chat streaming

Frontend

Assistente geral

Fase 3

WorkflowAgent

Insights

Alertas

Fase 4

Feature premium

Limites por plano

Métricas de uso IA

🔐 12. SEGURANÇA & LGPD

✔ Dados isolados
✔ Nenhum treino externo
✔ Logs anonimizados
✔ Controle por plano
✔ Auditoria total

✅ RESULTADO FINAL

Você entrega ao mercado:

✅ IA nativa do SaaS
✅ RAG hospitalar corporativo
✅ Copiloto analítico
✅ Diferencial competitivo real
✅ Arquitetura escalável e premium