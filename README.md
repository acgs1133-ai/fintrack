# FinTrack

Aplicação web de finanças pessoais — controle de transações, categorias, metas, recorrências/assinaturas, relatórios e insights. Tema escuro, com acento em verde.

Monorepo com duas aplicações:

```
FinTrack/
├── web/   → frontend (React + Vite + Tailwind)
└── api/   → backend (Express + Prisma + PostgreSQL)
```

## Stack

- **Frontend** (`web/`): React 18, Vite 5, Tailwind CSS 3, React Router 6, Zustand, Recharts, Axios, jsPDF, PapaParse.
- **Backend** (`api/`): Node.js, Express, Prisma ORM, PostgreSQL, Zod. Assistente opcional via `@anthropic-ai/sdk`.

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou uma `DATABASE_URL` acessível)

## Como rodar

### 1. Backend (`api/`)

```bash
cd api
npm install
cp .env.example .env          # ajuste DATABASE_URL (e ANTHROPIC_API_KEY, se for usar o assistente)
npx prisma migrate dev        # cria o schema no banco
npm run prisma:seed           # popula com dados de exemplo (opcional)
npm run dev                   # API em http://localhost:3001
```

### 2. Frontend (`web/`)

```bash
cd web
npm install
cp .env.example .env          # VITE_API_URL aponta para a API (padrão http://localhost:3001)
npm run dev                   # app em http://localhost:5173
```

## Variáveis de ambiente

Os arquivos `.env` **não** são versionados. Use os `.env.example` de cada pasta como referência.

| App | Variável | Descrição |
|-----|----------|-----------|
| api | `DATABASE_URL` | String de conexão do PostgreSQL |
| api | `PORT` | Porta da API (padrão `3001`) |
| api | `ANTHROPIC_API_KEY` | Opcional — habilita o assistente de IA |
| web | `VITE_API_URL` | URL base da API |

## Funcionalidades

- Lançamento rápido em linguagem natural ("café 15") com categorização automática por aprendizado
- Saldo "seguro para gastar" (desconta recorrências previstas e reserva de metas)
- Painel de recorrências/assinaturas com alerta de mudança de valor
- Metas com projeção realista baseada no histórico de aportes
- Classificação necessidade × desejo
- Comparação contextual de gastos por categoria (mês atual vs média)
- Divisão de contas com controle de "a receber" por pessoa
- Insights semanais acionáveis
- Relatórios com exportação em PDF e importação de CSV
