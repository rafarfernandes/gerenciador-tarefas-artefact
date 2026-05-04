/**
 * Formulário reutilizável de criação e edição de tarefa.
 *
 * - Sem prop `tarefa`  → modo criação
 * - Com prop `tarefa`  → modo edição (form pré-preenchido)
 *
 * Validação em duas camadas:
 * 1. Frontend (UX rápida) — impede submit se título vazio
 * 2. Backend (Zod no router) — fonte da verdade
 */

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { trpc } from "@/trpc/client";

type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

type Props = {
  tarefa?: Tarefa;
};

export function FormularioTarefa({ tarefa }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const ehEdicao = Boolean(tarefa);

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [erroForm, setErroForm] = useState<string | null>(null);

  const aoSucesso = () => {
    utils.tarefa.listar.invalidate();
    router.push("/");
    router.refresh();
  };

  const aoErro = (erro: { message: string }) => {
    setErroForm(erro.message ?? "Ocorreu um erro inesperado.");
  };

  const criar = trpc.tarefa.criar.useMutation({
    onSuccess: aoSucesso,
    onError: aoErro,
  });

  const atualizar = trpc.tarefa.atualizar.useMutation({
    onSuccess: aoSucesso,
    onError: aoErro,
  });

  const carregando = criar.isPending || atualizar.isPending;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroForm(null);

    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) {
      setErroForm("O título é obrigatório.");
      return;
    }

    const descricaoLimpa = descricao.trim() || undefined;

    if (ehEdicao && tarefa) {
      atualizar.mutate({
        id: tarefa.id,
        titulo: tituloLimpo,
        descricao: descricaoLimpa,
      });
    } else {
      criar.mutate({
        titulo: tituloLimpo,
        descricao: descricaoLimpa,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      noValidate
    >
      {erroForm && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{erroForm}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="titulo"
          className="block text-sm font-medium text-slate-700"
        >
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={200}
          disabled={carregando}
          required
          aria-required="true"
          className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
          placeholder="Ex: Comprar pão na padaria"
        />
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="block text-sm font-medium text-slate-700"
        >
          Descrição{" "}
          <span className="text-xs font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={1000}
          disabled={carregando}
          rows={4}
          className="mt-1.5 block w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
          placeholder="Detalhes adicionais sobre a tarefa..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={carregando || !titulo.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregando
            ? ehEdicao ? "Salvando..." : "Criando..."
            : ehEdicao ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}