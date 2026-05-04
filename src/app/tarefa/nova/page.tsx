import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormularioTarefa } from "@/app/_components/FormularioTarefa";

export default function NovaTarefaPage() {
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
          Nova tarefa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha os campos abaixo para criar uma nova tarefa.
        </p>
      </header>

      <FormularioTarefa />
    </main>
  );
}