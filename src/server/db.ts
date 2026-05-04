/**
 * Banco de dados em memória.
 *
 * Como o desafio não exige persistência, usamos um Map em memória.
 * Map é melhor que array porque permite busca/remoção por id em O(1).
 *
 * IMPORTANTE: a cada reinício do servidor (npm run dev), os dados
 * são perdidos. Em produção, isto seria substituído por um banco real
 * (Postgres, MongoDB, etc.) através de um ORM como Prisma ou Drizzle.
 */

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

// Map<id, Tarefa> — chave é o id, valor é a tarefa.
export const tarefasDb = new Map<string, Tarefa>();