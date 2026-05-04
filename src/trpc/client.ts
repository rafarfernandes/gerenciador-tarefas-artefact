/**
 * Cliente tRPC para uso em Client Components.
 *
 * createTRPCReact gera hooks tipados a partir do AppRouter.
 * Exemplo de uso no frontend:
 *   const { data } = trpc.tarefa.listar.useQuery();
 *   const criar = trpc.tarefa.criar.useMutation();
 *
 * A "mágica" da tipagem end-to-end vem do `import type` abaixo:
 * importamos só o TIPO do AppRouter (sem nenhum código de servidor)
 * e passamos pro createTRPCReact como generic.
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/api/root";

export const trpc = createTRPCReact<AppRouter>();