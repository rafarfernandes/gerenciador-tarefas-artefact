/**
 * Página de edição de tarefa.
 *
 * Server Component que:
 * - Lê o id da URL (params)
 * - Busca a tarefa via tRPC server-side
 * - Se não encontrar, retorna 404 (notFound)
 * - Se encontrar, passa a tarefa pra o FormularioTarefa em modo edição
 *
 * IMPORTANTE no Next.js 15: `params` agora é uma Promise, precisa de await.
 * (Era síncrono no Next 14 e versões anteriores.)
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioTarefa } from "@/app/_components/FormularioTarefa";
import { api } from "@/trpc/server";

// Não cacheia — sempre busca o estado atual da tarefa no servidor.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarTarefaPage({ params }: Props) {
  const { id } = await params;

  // Tenta buscar a tarefa. Se a procedure lançar TRPCError (NOT_FOUND),
  // capturamos e devolvemos 404 do Next.
  let tarefa;
  try {
    tarefa = await api.tarefa.obterPorId({ id });
  } catch {
    notFound();
  }

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
          Editar tarefa
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Atualize as informações da tarefa abaixo.
        </p>
      </header>

      <FormularioTarefa tarefa={tarefa} />
    </main>
  );
}