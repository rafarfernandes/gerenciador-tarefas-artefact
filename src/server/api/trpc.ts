/**
 * Inicialização do tRPC.
 *
 * Aqui criamos a instância base do tRPC e exportamos os helpers
 * que serão usados nos routers (router, publicProcedure).
 *
 * superjson é usado como transformer para que tipos como Date
 * sejam serializados/desserializados corretamente entre cliente e servidor
 * (JSON puro não suporta Date — viraria string).
 */

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.create({
  transformer: superjson,
  // Formata erros para incluir detalhes de validação do Zod
  // de forma estruturada — o cliente recebe os erros bonitinhos.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Helpers exportados para serem usados nos routers.
export const router = t.router;
export const publicProcedure = t.procedure;