import Link from "next/link";
import { Plus, ListTodo } from "lucide-react";
import { api } from "@/trpc/server";
import { ListaTarefas } from "./_components/ListaTarefas";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { itens, proximoCursor } = await api.tarefa.listar({ limit: 10 });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-indigo-600">
            <ListTodo className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Tarefas
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Minhas tarefas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize o que precisa ser feito.
          </p>
        </div>

        <Link
          href="/tarefa/nova"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Nova tarefa
        </Link>
      </header>

      <ListaTarefas initialItens={itens} initialCursor={proximoCursor} />
    </main>
  );
}