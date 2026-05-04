import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FormularioTarefa } from "@/app/_components/FormularioTarefa";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarTarefaPage({ params }: Props) {
  const { id } = await params;

  let tarefa;
  try {
    tarefa = await api.tarefa.obterPorId({ id });
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a lista
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Editar tarefa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Atualize as informações da tarefa abaixo.
        </p>
      </header>

      <FormularioTarefa tarefa={tarefa} />
    </main>
  );
}