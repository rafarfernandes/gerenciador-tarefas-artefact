/**
 * Componente que renderiza a lista de tarefas com exclusão.
 *
 * Recebe os dados iniciais via props (vindos do SSR) e os usa
 * como initialData do React Query. Isso faz com que:
 * - O usuário veja a lista imediatamente (SSR já trouxe os dados)
 * - Após mutações (excluir), o cache é invalidado e a lista
 *   se atualiza sozinha sem reload de página
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

// Tipo dos dados que vêm do SSR (definido pra ficar explícito).
type TarefaInicial = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

type Props = {
  initialItens: TarefaInicial[];
  initialCursor: string | null;
};

export function ListaTarefas({ initialItens, initialCursor }: Props) {
  // Estado de feedback ao usuário (mensagem de sucesso/erro temporária).
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  // Estado pra saber qual tarefa está sendo deletada (controla loading
  // por linha em vez de globalmente — UX mais correta com múltiplos botões).
  const [idDeletando, setIdDeletando] = useState<string | null>(null);

  // utils permite invalidar queries do tRPC manualmente (refetch).
  const utils = trpc.useUtils();

  // useQuery com initialData = "começa com os dados do SSR"; o React Query
  // não vai disparar refetch desnecessário porque já tem o dado.
  const { data } = trpc.tarefa.listar.useQuery(
    { limit: 10 },
    {
      initialData: {
        itens: initialItens,
        proximoCursor: initialCursor,
      },
    },
  );

  // Mutation de exclusão. onMutate dispara ANTES da request — boa pra
  // marcar o id que está sendo deletado e bloquear o botão.
  const deletar = trpc.tarefa.deletar.useMutation({
    onMutate: ({ id }) => {
      setIdDeletando(id);
    },
    onSuccess: () => {
      // Invalida a query da lista — força um refetch e atualiza a UI.
      utils.tarefa.listar.invalidate();
      setFeedback({ tipo: "sucesso", mensagem: "Tarefa excluída com sucesso." });
      setIdDeletando(null);
      // Esconde a mensagem após 3s.
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (erro) => {
      setFeedback({
        tipo: "erro",
        mensagem: erro.message ?? "Erro ao excluir tarefa.",
      });
      setIdDeletando(null);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const handleExcluir = (id: string, titulo: string) => {
    // Confirmação simples — em produção usaríamos um modal customizado,
    // mas window.confirm atende o requisito sem complicar.
    const confirmou = window.confirm(`Excluir a tarefa "${titulo}"?`);
    if (confirmou) {
      deletar.mutate({ id });
    }
  };

  const itens = data?.itens ?? [];

  return (
    <div className="space-y-4">
      {/* Mensagem de feedback (sucesso ou erro) */}
      {feedback && (
        <div
          role="alert"
          className={
            feedback.tipo === "sucesso"
              ? "rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800"
              : "rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          }
        >
          {feedback.mensagem}
        </div>
      )}

      {/* Estado vazio */}
      {itens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-600">Nenhuma tarefa por aqui ainda.</p>
          <Link
            href="/tarefa/nova"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Criar a primeira tarefa →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {itens.map((tarefa) => (
            <li
              key={tarefa.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {tarefa.titulo}
                  </h3>
                  {tarefa.descricao && (
                    <p className="mt-1 text-sm text-gray-600">
                      {tarefa.descricao}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Criada em{" "}
                    {new Date(tarefa.dataCriacao).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/tarefa/${tarefa.id}/editar`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleExcluir(tarefa.id, tarefa.titulo)}
                    disabled={idDeletando === tarefa.id}
                    className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {idDeletando === tarefa.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}