// Normalização de tags do diário.
//
// Funções PURAS (sem dependência de servidor) — usadas no cliente (criar chip) e no
// servidor (autoridade ao gravar). Decisão de dedup (ADR 0021): trim + lowercase +
// colapso de espaços internos, removendo um "#" inicial e limitando o tamanho. Acentos
// são PRESERVADOS — "saúde" e "saude" são tags distintas (não há accent-folding).

export const MAX_TAGS = 8; // por entrada
const MAX_LEN = 30; // por tag

export function normalizarTag(bruto: string): string {
  return bruto
    .trim()
    .replace(/^#+/, "") // "#trabalho" → "trabalho"
    .replace(/\s+/g, " ") // colapsa espaços internos
    .toLowerCase()
    .slice(0, MAX_LEN);
}

// Converte o campo de transporte (nomes separados por vírgula ou quebra de linha) numa
// lista normalizada, sem duplicatas e limitada a MAX_TAGS.
export function parseTags(bruto: string): string[] {
  const vistos = new Set<string>();
  for (const parte of bruto.split(/[\n,]/)) {
    const nome = normalizarTag(parte);
    if (nome) vistos.add(nome);
  }
  return [...vistos].slice(0, MAX_TAGS);
}
