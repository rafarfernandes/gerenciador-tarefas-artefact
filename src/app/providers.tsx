/**
 * Providers globais do aplicativo (Client Component).
 *
 * Envolve toda a árvore React com:
 * - QueryClientProvider: gerencia cache/estado das queries (do React Query)
 * - trpc.Provider: liga o cliente tRPC ao QueryClient
 *
 * Importante: este arquivo é "use client" porque QueryClient
 * só existe no navegador (mantém estado em memória local).
 */

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "@/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState garante que QueryClient e trpcClient sejam criados UMA vez
  // por ciclo de vida do componente — não a cada render.
  // Sem isso, cada re-render criaria um cache novo e perderia os dados.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Mantém os dados "frescos" por 30s antes de refetchear
        staleTime: 30 * 1000,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // Mesmo transformer usado no servidor — necessário pra Date funcionar.
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}