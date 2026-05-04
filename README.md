# Gerenciador de Tarefas

Sistema simples de gerenciamento de tarefas construído com **Next.js 15**, **tRPC**, **TypeScript** e **Tailwind CSS**. Os dados são mantidos em memória no servidor — não há persistência em banco.

> Caso técnico desenvolvido para o processo seletivo de Intern Web Developer da Artefact.

## ✨ Funcionalidades

- ✅ Listagem de tarefas com **Server-Side Rendering (SSR)**
- ✅ Criação, edição e exclusão de tarefas
- ✅ Validação ponta-a-ponta (frontend + backend) via Zod
- ✅ Tipagem end-to-end automática com tRPC
- ✅ Feedback visual de sucesso e erro em todas as operações
- ✅ **Infinite scroll** com cursor pagination (bônus)
- ✅ Acessibilidade básica (labels, aria-attributes, foco visível)

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| API | tRPC v11 |
| Validação | Zod |
| Cache de dados | TanStack Query (React Query) |
| Estilo | Tailwind CSS |
| Ícones | lucide-react |

## 🚀 Como executar

### Pré-requisitos

- Node.js 18.18+ (recomendado: Node 22 LTS)
- npm

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/rafarfernandes/gerenciador-tarefas-artefact.git
cd gerenciador-tarefas-artefact
```

2. Instale as dependências:

```bash
npm install
```

3. Rode em modo de desenvolvimento:

```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal).

> **Observação:** como os dados são armazenados em memória, **eles são perdidos a cada reinício do servidor**. Em produção, este store seria substituído por um banco real (Postgres, MongoDB, etc.).

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── _components/             # Componentes específicos da UI
│   │   ├── FormularioTarefa.tsx # Form reutilizável (criar/editar)
│   │   └── ListaTarefas.tsx     # Lista com infinite scroll + exclusão
│   ├── api/trpc/[trpc]/route.ts # Endpoint HTTP do tRPC
│   ├── tarefa/
│   │   ├── nova/page.tsx        # Página de criação
│   │   └── [id]/editar/page.tsx # Página de edição
│   ├── layout.tsx               # Layout raiz com Providers
│   ├── page.tsx                 # Listagem (SSR)
│   ├── providers.tsx            # QueryClient + tRPC providers (Client)
│   └── globals.css              # Tailwind base
├── server/
│   ├── api/
│   │   ├── routers/tarefa.ts    # CRUD de tarefas
│   │   ├── root.ts              # Router raiz (agrega sub-routers)
│   │   └── trpc.ts              # Inicialização do tRPC
│   └── db.ts                    # Store em memória (Map)
└── trpc/
    ├── client.ts                # Cliente React do tRPC (hooks tipados)
    └── server.ts                # Caller server-side (para SSR sem HTTP)
```

## 🧠 Decisões técnicas

### Por que tRPC?
A tipagem end-to-end automática elimina o esquema duplicado (sem manter tipos REST manualmente nem schema GraphQL). Combinado com Zod, garante validação em runtime usando o mesmo schema que tipa o input em tempo de compilação.

### Por que `Map` em vez de `[]` no store?
Acesso e remoção por id em O(1). Em arrays seria O(n) (a cada `find`/`splice`). Decisão pequena, mas mostra cuidado com complexidade.

### Por que SSR na listagem em vez de SSG?
As tarefas mudam o tempo todo, então SSG (build-time) não serviria. CSR puro daria flash de loading. SSR garante que o usuário receba o HTML já com os dados.

### Por que cursor pagination em vez de offset/limit?
Cursor é estável quando novas tarefas são adicionadas no topo durante a navegação — com offset, novas inserções fariam o usuário "pular" itens ou ver duplicados.

### Por que Server Component fazer SSR sem HTTP?
Em vez de o servidor fazer fetch nele mesmo, o `appRouter.createCaller({})` permite chamar as procedures diretamente em Node.js. Sem latência de rede, sem serialização desnecessária.

### Validação em duas camadas
- **Frontend:** previne envios óbvios (título vazio) — UX rápida.
- **Backend (Zod):** fonte da verdade. Se um cliente burlar o frontend, o servidor recusa.

## 🔐 Segurança

Como este é um teste técnico sem autenticação, todas as procedures são `publicProcedure`. Em produção:
- Adicionaria `protectedProcedure` que valida sessão via context.
- Filtros por `userId` em todas as queries.
- Rate limiting no endpoint HTTP.

## ⚖️ Limitações conhecidas

- **Sem persistência:** dados se perdem ao reiniciar o servidor (intencional, conforme o desafio).
- **Sem autenticação:** todos veem todas as tarefas.
- **Confirmação de exclusão usa `window.confirm`:** em produção, um modal customizado seria mais consistente com o design system.

## 📜 Scripts disponíveis

| Comando | Ação |
|---------|------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor em modo produção (após build) |