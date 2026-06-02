// Constantes de configuração da sessão.
//
// Este arquivo é PROPOSITALMENTE livre de dependências (sem importar Prisma, Node
// crypto ou next/headers), para poder ser importado tanto pelo session.ts (runtime
// Node) quanto pelo proxy.ts (runtime edge) sem arrastar o Prisma para o bundle do edge.

// Nome do cookie de sessão.
export const NOME_COOKIE = "mindlog_sessao";

// Duração da sessão: 30 dias, em milissegundos.
export const DURACAO_MS = 30 * 24 * 60 * 60 * 1000;
