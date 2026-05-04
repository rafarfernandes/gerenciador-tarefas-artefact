/**
 * Página inicial — listagem de tarefas com SSR.
 *
 * Esta é uma Server Component (default no App Router): roda no servidor,
 * busca os dados via tRPC direto (sem HTTP), e devolve HTML pronto.
 *
 * O componente <ListaTarefas /> é Client Component e recebe os dados
 * iniciais via props pra hidratar o React Query.
 */

import Link from "next/link";
import { api } from "@/trpc/server";
import { ListaTarefas } from "./_components/ListaTarefas";

// Força SSR a cada request (nunca cacheia estaticamente).
// Como as tarefas mudam o tempo todo, queremos sempre dados frescos.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Chamada direta ao router tRPC no servidor — sem HTTP, sem latência.
  const { itens, proximoCursor } = await api.tarefa.listar({ limit: 10 });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciador de Tarefas
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {itens.length === 0
              ? "Você ainda não tem tarefas."
              : `${itens.length} tarefa${itens.length > 1 ? "s" : ""} carregada${itens.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Link
          href="/tarefa/nova"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          + Nova tarefa
        </Link>
      </header>

      <ListaTarefas initialItens={itens} initialCursor={proximoCursor} />
    </main>
  );
}