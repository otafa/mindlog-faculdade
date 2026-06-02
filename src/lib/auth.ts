// Helpers de hash de senha (Argon2id).
//
// Decisão registrada em docs/decisoes.md (ADR 0013): Argon2id via @node-rs/argon2,
// com os parâmetros mínimos recomendados pelo OWASP. Os parâmetros ficam embutidos
// na própria string do hash (formato PHC), então a verificação os lê automaticamente
// — não guardamos memoryCost/timeCost/parallelism à parte no banco.

import { hash, verify, type Algorithm } from "@node-rs/argon2";

// Algorithm é um `const enum`, e o isolatedModules (usado pelo Next) proíbe acessar
// seus membros (Algorithm.Argon2id). Usamos o valor literal 2 (= Argon2id) com cast.
const ARGON2ID = 2 as Algorithm;

// Parâmetros OWASP para Argon2id (mínimo recomendado).
const OPCOES_HASH = {
  algorithm: ARGON2ID,
  memoryCost: 19456, // 19 MiB, em KiB
  timeCost: 2, // iterações
  parallelism: 1, // grau de paralelismo
} as const;

/**
 * Gera o hash Argon2id de uma senha em texto puro.
 * O resultado é uma string no formato PHC, que já inclui o salt e os parâmetros.
 */
export async function hashSenha(senha: string): Promise<string> {
  return hash(senha, OPCOES_HASH);
}

/**
 * Verifica uma senha em texto puro contra um hash Argon2id.
 * Retorna `false` (em vez de lançar) se o hash for inválido ou estiver corrompido,
 * para que o chamador trate "senha incorreta" e "hash inválido" do mesmo jeito.
 */
export async function verificarSenha(
  senha: string,
  hashArmazenado: string,
): Promise<boolean> {
  try {
    // Atenção: a API do @node-rs/argon2 recebe (hash, senha) nessa ordem.
    return await verify(hashArmazenado, senha);
  } catch {
    return false;
  }
}
