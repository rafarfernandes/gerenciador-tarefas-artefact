/**
 * Formulário reutilizável de criação e edição de tarefa.
 *
 * - Sem prop `tarefa`  → modo criação (form vazio, chama criar)
 * - Com prop `tarefa`  → modo edição (form pré-preenchido, chama atualizar)
 *
 * Validação acontece em duas camadas:
 * 1. No frontend (UX rápida) — impede submit se título vazio.
 * 2. No backend (Zod) — fonte da verdade. Se o frontend for burlado,
 *    o backend recusa.
 */

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";

type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

type Props = {
  /** Se fornecido, o formulário entra em modo edição. */
  tarefa?: Tarefa;
};

export function FormularioTarefa({ tarefa }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const ehEdicao = Boolean(tarefa);

  // Estado controlado dos campos.
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");

  // Mensagem de erro (de validação ou do backend).
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Mutations — uma pra criar, outra pra atualizar.
  // Compartilham os mesmos handlers de sucesso/erro.
  const aoSucesso = () => {
    // Invalida a listagem pra refletir a mudança quando voltar pra home.
    utils.tarefa.listar.invalidate();
    router.push("/");
    router.refresh(); // garante que o SSR rode de novo na home
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

    // Validação do frontend: título não pode ser vazio.
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) {
      setErroForm("O título é obrigatório.");
      return;
    }

    // Descrição vira undefined se estiver vazia (campo opcional).
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
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      noValidate
    >
      {/* Mensagem de erro global (validação ou backend) */}
      {erroForm && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {erroForm}
        </div>
      )}

      {/* Campo título */}
      <div>
        <label
          htmlFor="titulo"
          className="block text-sm font-medium text-gray-700"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Ex: Comprar pão na padaria"
        />
      </div>

      {/* Campo descrição */}
      <div>
        <label
          htmlFor="descricao"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição{" "}
          <span className="text-xs font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={1000}
          disabled={carregando}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Detalhes adicionais sobre a tarefa..."
        />
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={carregando || !titulo.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregando
            ? ehEdicao
              ? "Salvando..."
              : "Criando..."
            : ehEdicao
              ? "Salvar alterações"
              : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}