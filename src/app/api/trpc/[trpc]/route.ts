/**
 * Endpoint HTTP do tRPC dentro do Next.js (App Router).
 *
 * O Next.js direciona toda requisição que bate em /api/trpc/*
 * para este handler. O fetchRequestHandler do tRPC se encarrega
 * de pegar a procedure (ex: tarefa.criar), validar input,
 * executar e devolver a resposta.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}), // sem contexto/auth neste desafio
    onError: ({ path, error }) => {
      // Log dos erros do servidor — útil em dev pra debugar.
      console.error(`❌ tRPC falhou em '${path}':`, error.message);
    },
  });

// O App Router exige que cada método HTTP seja exportado nominalmente.
// tRPC usa só GET e POST (queries vão por GET, mutations por POST).
export { handler as GET, handler as POST };