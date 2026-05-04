/**
 * Cliente tRPC para uso em Server Components (SSR).
 *
 * Em vez de fazer fetch HTTP do servidor pra ele mesmo (lento, desnecessário),
 * usamos createCaller — que invoca as procedures diretamente em Node.js.
 *
 * Exemplo de uso numa Server Component (page.tsx):
 *   const { itens } = await api.tarefa.listar();
 */

import "server-only"; // garante que este módulo nunca acabe no bundle do cliente

import { appRouter } from "@/server/api/root";

// createCaller transforma o router num objeto chamável diretamente.
// O argumento é o context — vazio aqui, igual ao endpoint HTTP.
export const api = appRouter.createCaller({});