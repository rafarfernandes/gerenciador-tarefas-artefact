/**
 * Lista de tarefas com infinite scroll e exclusão.
 *
 * Usa useInfiniteQuery do tRPC + IntersectionObserver pra carregar
 * mais tarefas conforme o usuário rola a página. O backend retorna
 * o cursor da próxima página, e o React Query gerencia a paginação.
 *
 * Os dados iniciais (primeira página) vêm do SSR via props,
 * evitando a primeira chamada de rede.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Pencil, Trash2, Inbox } from "lucide-react";
import { trpc } from "@/trpc/client";

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
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  const [idDeletando, setIdDeletando] = useState<string | null>(null);

  // Sentinela do IntersectionObserver — quando entra na viewport, carrega mais.
  // Tipo HTMLLIElement porque a sentinela é um <li> (filho semanticamente
  // correto de um <ul>).
  const sentinelaRef = useRef<HTMLLIElement | null>(null);

  const utils = trpc.useUtils();

  // useInfiniteQuery: gerencia páginas automaticamente.
  // initialData precisa ter o formato { pages, pageParams } pro infinite query.
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.tarefa.listar.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (ultima) => ultima.proximoCursor ?? undefined,
      initialData: {
        pages: [{ itens: initialItens, proximoCursor: initialCursor }],
        pageParams: [undefined],
      },
    },
  );

  // Achata todas as páginas num array único pra renderizar.
  const itens = data?.pages.flatMap((p) => p.itens) ?? [];

  // IntersectionObserver: dispara fetchNextPage quando a sentinela
  // entra na viewport (com 200px de margem antecipada pra ficar suave).
  useEffect(() => {
    const elemento = sentinelaRef.current;
    if (!elemento || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deletar = trpc.tarefa.deletar.useMutation({
    onMutate: ({ id }) => setIdDeletando(id),
    onSuccess: () => {
      utils.tarefa.listar.invalidate();
      setFeedback({ tipo: "sucesso", mensagem: "Tarefa excluída com sucesso." });
      setIdDeletando(null);
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
    if (window.confirm(`Excluir a tarefa "${titulo}"?`)) {
      deletar.mutate({ id });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast de feedback */}
      {feedback && (
        <div
          role="alert"
          className={
            feedback.tipo === "sucesso"
              ? "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {feedback.tipo === "sucesso" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.mensagem}</span>
        </div>
      )}

      {/* Estado vazio */}
      {itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Inbox className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-medium text-slate-900">
            Nenhuma tarefa por aqui
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Comece criando sua primeira tarefa.
          </p>
          <Link
            href="/tarefa/nova"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Criar tarefa
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {itens.map((tarefa) => (
            <li
              key={tarefa.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {tarefa.titulo}
                  </h3>
                  {tarefa.descricao && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {tarefa.descricao}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    Criada em{" "}
                    {new Date(tarefa.dataCriacao).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <Link
                    href={`/tarefa/${tarefa.id}/editar`}
                    aria-label="Editar tarefa"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleExcluir(tarefa.id, tarefa.titulo)}
                    disabled={idDeletando === tarefa.id}
                    aria-label="Excluir tarefa"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}

          {/* Sentinela do infinite scroll + indicador de carregamento */}
          {hasNextPage && (
            <li
              ref={sentinelaRef}
              className="flex items-center justify-center py-6 text-sm text-slate-400"
            >
              {isFetchingNextPage ? "Carregando mais tarefas..." : ""}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}