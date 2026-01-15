# Stack Tecnológica - VSA Analytics Health

## 📋 Visão Geral

Este documento descreve toda a stack tecnológica utilizada no projeto **VSA Analytics Health**, uma plataforma SaaS multi-tenant de Business Intelligence para hospitais.

## 🏗️ Arquitetura

### Tipo de Aplicação
- **Frontend**: Single Page Application (SPA)
- **Arquitetura**: Multi-tenant SaaS
- **Padrão**: Component-based Architecture

## 🚀 Core Technologies

### Build Tool & Bundler
- **Vite** `^5.4.19`
  - Build tool moderno e rápido
  - HMR (Hot Module Replacement) para desenvolvimento
  - Porta: `8080`
  - Plugin: `@vitejs/plugin-react-swc` para compilação rápida com SWC

### Linguagem Principal
- **TypeScript** `^5.8.3`
  - Tipagem estática
  - Configuração flexível (strictNullChecks: false, noImplicitAny: false)
  - Path aliases configurados: `@/*` → `./src/*`

### Framework Frontend
- **React** `^18.3.1`
  - Biblioteca UI declarativa
  - React DOM `^18.3.1`
  - Hooks modernos

### Roteamento
- **React Router DOM** `^6.30.1`
  - Roteamento client-side
  - Nested routes
  - Programmatic navigation

## 🎨 UI & Styling

### Framework CSS
- **Tailwind CSS** `^3.4.17`
  - Utility-first CSS framework
  - Dark mode support (`class` strategy)
  - Custom theme com variáveis CSS
  - Plugins:
    - `tailwindcss-animate` `^1.0.7`
    - `@tailwindcss/typography` `^0.5.16`

### Componentes UI
- **shadcn/ui** (via Radix UI)
  - Biblioteca de componentes acessíveis
  - Baseada em Radix UI Primitives
  - Customizável via Tailwind
  - Componentes disponíveis:
    - Accordion, Alert Dialog, Avatar, Checkbox
    - Collapsible, Context Menu, Dialog, Dropdown Menu
    - Hover Card, Label, Menubar, Navigation Menu
    - Popover, Progress, Radio Group, Scroll Area
    - Select, Separator, Slider, Switch, Tabs
    - Toast, Toggle, Toggle Group, Tooltip

### Ícones
- **Lucide React** `^0.462.0`
  - Biblioteca de ícones moderna
  - Tree-shakeable
  - TypeScript support

### Animações
- **Framer Motion** `^12.23.26`
  - Biblioteca de animações para React
  - Animações fluidas e performáticas

## 📊 Data Visualization

### Gráficos
- **Recharts** `^2.15.4`
  - Biblioteca de gráficos para React
  - Componentes disponíveis:
    - LineChart, BarChart, PieChart, AreaChart
    - Treemap, Tooltip, Legend, Label
  - Gráficos customizados:
    - `SimpleLineChart`
    - `SimpleBarChart`
    - `SimpleAreaChart`
    - `SimplePieChart`
    - `MultiLineChart`
    - `DonutChart` (customizado)
    - `TreeMapChart` (customizado)
    - `GaugeChart` (customizado)

## 🔄 State Management

### Client State
- **Zustand** `^5.0.9`
  - Gerenciamento de estado global
  - Lightweight e performático
  - Stores em `src/stores/`

### Server State
- **TanStack Query (React Query)** `^5.83.0`
  - Gerenciamento de estado do servidor
  - Cache, refetch, mutations
  - DevTools disponível

## 📝 Forms & Validation

### Formulários
- **React Hook Form** `^7.61.1`
  - Gerenciamento de formulários performático
  - Validação integrada

### Validação
- **Zod** `^3.25.76`
  - Schema validation
  - TypeScript-first
  - Integração com React Hook Form via `@hookform/resolvers` `^3.10.0`

## 🛠️ Utilities & Helpers

### CSS Utilities
- **clsx** `^2.1.1` - Conditional classnames
- **tailwind-merge** `^2.6.0` - Merge Tailwind classes
- **class-variance-authority** `^0.7.1` - Variant management

### Date Handling
- **date-fns** `^3.6.0` - Manipulação de datas
- **react-day-picker** `^8.10.1` - Componente de seleção de data

### Outros
- **cmdk** `^1.1.1` - Command menu component
- **input-otp** `^1.4.2` - OTP input component
- **sonner** `^1.7.4` - Toast notifications
- **vaul** `^0.9.9` - Drawer component
- **embla-carousel-react** `^8.6.0` - Carousel component
- **react-resizable-panels** `^2.1.9` - Resizable panels
- **next-themes** `^0.3.0` - Theme switching

## 🔧 Development Tools

### Linting & Formatting
- **ESLint** `^9.32.0`
  - Configuração: `eslint.config.js`
  - Plugins:
    - `eslint-plugin-react-hooks` `^5.2.0`
    - `eslint-plugin-react-refresh` `^0.4.20`
    - `typescript-eslint` `^8.38.0`
  - Regras customizadas para TypeScript

### PostCSS
- **PostCSS** `^8.5.6`
  - Processamento CSS
  - Plugins:
    - `tailwindcss`
    - `autoprefixer` `^10.4.21`

### Development Plugins
- **lovable-tagger** `^1.1.13`
  - Component tagging em modo desenvolvimento
  - Integrado via Vite plugin

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── dashboard/      # Componentes específicos de dashboard
│   ├── layout/         # Componentes de layout
│   ├── modules/        # Componentes de módulos
│   └── ui/            # Componentes UI base (shadcn/ui)
├── config/             # Arquivos de configuração
│   └── navigation.ts  # Configuração de navegação
├── data/              # Dados mock (se necessário)
├── hooks/             # Custom React hooks
├── lib/               # Bibliotecas e utilitários
│   ├── business-rules/ # Regras de negócio
│   │   ├── assistencial/
│   │   ├── gerencial/
│   │   └── dashboard/
│   └── utils.ts       # Funções utilitárias
├── pages/             # Páginas da aplicação
│   ├── dashboard/     # Dashboards principais
│   ├── modules/       # Páginas de módulos
│   │   ├── assistencial/
│   │   └── gerencial/
│   └── configuracoes/
├── stores/            # Zustand stores
├── types/             # Definições TypeScript
│   ├── dashboard.ts
│   ├── filters.ts
│   ├── kpis.ts
│   ├── modules.ts
│   └── navigation.ts
└── App.tsx            # Componente raiz
```

## 🎯 Principais Funcionalidades

### Módulos Assistenciais
- Atendimentos
- Ambulatório
- Agendas
- Internação
- Exames Laboratoriais
- Exames de Imagem
- Agência Transfusional
- Farmácia
- CCIH
- Fisioterapia
- UTI
- Nutrição

### Módulos Gerenciais
- Estoque
- Faturamento
- Financeiro
- Higienização
- Lavanderia
- Hotelaria
- SPP
- TI
- SESMT

### Dashboards
- Dashboard Principal (Visão Geral)
- Dashboard de Internações
- Dashboard de Ocupação de Leitos
- Dashboard de Atendimentos
- Dashboard de Indicadores Gerais

## 🔐 Autenticação & Segurança

### Planejado (não implementado)
- **Supabase Auth** - Autenticação multi-tenant
- **JWT** - Tokens de autenticação
- **Row Level Security (RLS)** - Segurança a nível de linha

## 📦 Gerenciamento de Pacotes

### Package Manager
- **pnpm** (preferencial conforme regras do projeto)
- Alternativas: npm, yarn (não recomendados)

## 🌐 Servidor de Desenvolvimento

### Configuração
- **Host**: `::` (IPv6/IPv4)
- **Porta**: `8080`
- **HMR**: Habilitado
- **Auto-reload**: Habilitado

## 🎨 Sistema de Design

### Cores
- Sistema de cores baseado em HSL
- Variáveis CSS para temas
- Suporte a dark mode
- Cores customizadas:
  - Primary, Secondary, Destructive
  - Muted, Accent, Popover, Card
  - Sidebar (cores específicas)

### Tipografia
- **Font Sans**: Inter
- **Font Serif**: Lora
- **Font Mono**: Space Mono

### Componentes Customizados
- **KPICard**: Cards de indicadores
- **ChartCard**: Container para gráficos
- **ModuleLayout**: Layout padrão para módulos
- **AppLayout**: Layout principal da aplicação
- **AppSidebar**: Sidebar de navegação

## 📊 Business Rules

### Estrutura
As regras de negócio estão centralizadas em `src/lib/business-rules/`:

- **Assistencial**: Regras para módulos assistenciais
- **Gerencial**: Regras para módulos gerenciais
- **Dashboard**: Regras para dashboards

### Funções Principais
- Cálculos de KPIs
- Validações de dados
- Permissões (planejado)
- Transformações de dados

## 🔄 Data Flow

```
API/Database → TanStack Query → Components → Zustand (se necessário) → UI
```

## 📱 Responsividade

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Grid System
- Grid responsivo com Tailwind
- Colunas adaptáveis por breakpoint
- Layout mobile-first

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento na porta 8080

# Build
pnpm build            # Build de produção
pnpm build:dev        # Build de desenvolvimento

# Qualidade
pnpm lint              # Executa ESLint

# Preview
pnpm preview          # Preview do build
```

## 📚 Dependências Principais (Resumo)

### Runtime Dependencies
- React 18.3.1
- React Router DOM 6.30.1
- TanStack Query 5.83.0
- Zustand 5.0.9
- Recharts 2.15.4
- React Hook Form 7.61.1
- Zod 3.25.76
- Radix UI (múltiplos pacotes)
- Tailwind CSS 3.4.17
- Lucide React 0.462.0

### Development Dependencies
- Vite 5.4.19
- TypeScript 5.8.3
- ESLint 9.32.0
- TypeScript ESLint 8.38.0
- Tailwind CSS 3.4.17
- PostCSS 8.5.6
- Autoprefixer 10.4.21

## 🔗 Integrações Planejadas

- **Supabase**: Backend e autenticação
- **PostgreSQL**: Banco de dados
- **Row Level Security**: Segurança multi-tenant

## 📝 Notas Importantes

1. **Porta Padrão**: O servidor roda na porta `8080` (não 3000)
2. **Package Manager**: Usar `pnpm` exclusivamente
3. **TypeScript**: Configuração flexível para desenvolvimento rápido
4. **Component Tagger**: Ativo apenas em modo desenvolvimento
5. **Path Aliases**: Usar `@/` para imports de `src/`

## 🎯 Próximos Passos (Roadmap)

- [ ] Integração com Supabase
- [ ] Autenticação multi-tenant
- [ ] API backend
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Documentação de API
- [ ] Performance monitoring

---

**Última atualização**: Janeiro 2025
**Versão do Projeto**: 0.0.0 (desenvolvimento)
