/**
 * Página de criação de nova tarefa.
 *
 * Server Component simples — apenas renderiza o formulário.
 * Toda a lógica de submissão está no FormularioTarefa (Client Component).
 */

import Link from "next/link";
import { FormularioTarefa } from "@/app/_components/FormularioTarefa";

export default function NovaTarefaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar para a lista
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Nova tarefa
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Preencha os campos abaixo para criar uma nova tarefa.
        </p>
      </header>

      <FormularioTarefa />
    </main>
  );
}