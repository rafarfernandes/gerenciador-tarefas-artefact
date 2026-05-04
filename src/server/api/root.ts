/**
 * Router raiz — agrega todos os sub-routers da aplicação.
 *
 * Em apps maiores, viriam coisas como:
 *   usuario: usuarioRouter,
 *   projeto: projetoRouter,
 * Para este desafio temos só o router de tarefas.
 *
 * O tipo AppRouter é exportado e usado no cliente para
 * inferir todos os tipos das procedures automaticamente.
 */

import { router } from "./trpc";
import { tarefaRouter } from "./routers/tarefa";

export const appRouter = router({
  tarefa: tarefaRouter,
});

// Tipo exportado pra ser usado no cliente — é a "magia" da tipagem end-to-end.
export type AppRouter = typeof appRouter;