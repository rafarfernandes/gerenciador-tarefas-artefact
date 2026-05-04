/**
 * Router de tarefas — define todas as procedures do CRUD.
 *
 * Cada procedure declara:
 * - .input(zodSchema)   — validação do input (também gera o tipo TS)
 * - .query() ou .mutation() — query é "ler", mutation é "alterar"
 * - O handler propriamente dito, com acesso ao input já tipado/validado
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

import { router, publicProcedure } from "../trpc";
import { tarefasDb, type Tarefa } from "../../db";

// Schema de criação — título obrigatório (mín. 1 char), descrição opcional.
const criarTarefaSchema = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório"),
  descricao: z.string().trim().optional(),
});

// Schema de atualização — id obrigatório; título e descrição opcionais
// (o usuário pode editar só o que quiser).
const atualizarTarefaSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().trim().min(1, "O título é obrigatório").optional(),
  descricao: z.string().trim().optional(),
});

export const tarefaRouter = router({
  /**
   * Lista todas as tarefas, ordenadas da mais recente pra mais antiga.
   * Suporta paginação via cursor (necessário pro infinite scroll).
   *
   * "Cursor pagination" é melhor que paginação por offset porque
   * é estável quando novas tarefas são adicionadas no topo.
   */
  listar: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
          cursor: z.string().nullish(), // id da última tarefa da página anterior
        })
        .default({ limit: 10 }),
    )
    .query(({ input }) => {
      // Converte o Map num array ordenado por dataCriacao (desc).
      const todas: Tarefa[] = Array.from(tarefasDb.values()).sort(
        (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime(),
      );

      // Acha o índice de início baseado no cursor (id da última tarefa vista).
      const cursorIndex = input.cursor
        ? todas.findIndex((t) => t.id === input.cursor)
        : -1;
      const inicio = cursorIndex >= 0 ? cursorIndex + 1 : 0;

      // Pega "limit + 1" pra saber se ainda há mais páginas.
      const fatia = todas.slice(inicio, inicio + input.limit + 1);
      const temMais = fatia.length > input.limit;
      const itens = temMais ? fatia.slice(0, -1) : fatia;
      const proximoCursor = temMais ? itens[itens.length - 1].id : null;

      return {
        itens,
        proximoCursor,
      };
    }),

  /**
   * Retorna uma tarefa específica por id (usado na página de edição).
   */
  obterPorId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ input }) => {
      const tarefa = tarefasDb.get(input.id);
      if (!tarefa) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tarefa não encontrada",
        });
      }
      return tarefa;
    }),

  /**
   * Cria uma nova tarefa.
   * O Zod já garante que o título não está vazio antes de chegar aqui.
   */
  criar: publicProcedure
    .input(criarTarefaSchema)
    .mutation(({ input }) => {
      const novaTarefa: Tarefa = {
        id: randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao,
        dataCriacao: new Date(),
      };
      tarefasDb.set(novaTarefa.id, novaTarefa);
      return novaTarefa;
    }),

  /**
   * Atualiza uma tarefa existente.
   * Erro 404 se o id não existir.
   */
  atualizar: publicProcedure
    .input(atualizarTarefaSchema)
    .mutation(({ input }) => {
      const existente = tarefasDb.get(input.id);
      if (!existente) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tarefa não encontrada para atualização",
        });
      }

      const atualizada: Tarefa = {
        ...existente,
        // Só sobrescreve campos que vieram no input (undefined mantém o original)
        titulo: input.titulo ?? existente.titulo,
        descricao: input.descricao ?? existente.descricao,
      };
      tarefasDb.set(atualizada.id, atualizada);
      return atualizada;
    }),

  /**
   * Deleta uma tarefa.
   * Erro 404 se o id não existir.
   */
  deletar: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => {
      if (!tarefasDb.has(input.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tarefa não encontrada para exclusão",
        });
      }
      tarefasDb.delete(input.id);
      return { sucesso: true, id: input.id };
    }),
});