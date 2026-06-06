// Agregações para a tela de Insights.
//
// Foco do projeto: agregação no banco via SQL (AVG, COUNT). Usamos os helpers de
// agregação do Prisma (que geram AVG/COUNT) e, onde precisamos agrupar por DIA, SQL
// cru com a conversão de fuso.
//
// Fuso (ADR 0011): o DateTime é gravado em UTC; para agrupar por dia no horário de
// São Paulo aplicamos o offset -3h no SQL — America/Sao_Paulo é UTC-3 fixo (o Brasil
// não adota horário de verão desde 2019). Se isso mudar, revisar este offset.

import { prisma } from "@/lib/db";

const OFFSET_SP = "-3 hours";

export type HumorPorDia = {
  dia: string; // "YYYY-MM-DD" no horário de São Paulo
  media: number;
};

export type ContagemHumor = {
  humor: number; // 1..4
  total: number;
};

export type HumorPorDiaSemana = {
  diaSemana: number; // 0=Domingo ... 6=Sábado (strftime '%w')
  media: number;
  total: number;
};

export type Insights = {
  totalCheckins: number;
  diasSeguidos: number;
  totalEntradasDiario: number;
  totalSessoesIa: number;
  mediaHumor7Dias: number | null;
  humorPorDia7Dias: HumorPorDia[];
  // Visualizações de 30 dias (somente leitura — agregadas no banco).
  distribuicaoHumor30Dias: ContagemHumor[]; // sempre 4 itens (1..4), zeros incluídos
  humorPorDiaSemana30Dias: HumorPorDiaSemana[]; // só dias da semana com check-in
};

export async function obterInsights(usuarioId: string): Promise<Insights> {
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCheckins,
    mediaAgg,
    totalEntradasDiario,
    totalSessoesIa,
    diasSeguidos,
    humorPorDia7Dias,
    distribuicaoRaw,
    porDiaSemanaRaw,
  ] = await Promise.all([
    // Total de check-ins (usado para decidir se há dados suficientes p/ os insights).
    prisma.registroHumor.count({ where: { usuarioId, deletadoEm: null } }),
    // Média do humor (AVG) na janela móvel dos últimos 7 dias.
    prisma.registroHumor.aggregate({
      _avg: { humor: true },
      where: { usuarioId, deletadoEm: null, criadoEm: { gte: seteDiasAtras } },
    }),
    // Contagem de entradas de diário ativas.
    prisma.entradaDiario.count({ where: { usuarioId, deletadoEm: null } }),
    // Contagem de conversas com a IA (0 até o chat existir).
    prisma.sessaoChat.count({ where: { usuarioId, deletadoEm: null } }),
    // Streak: dias consecutivos de check-in (mesma fonte usada no dashboard).
    obterDiasSeguidos(usuarioId),
    // Média de humor por dia (SP) nos últimos 7 dias, para o gráfico.
    prisma.$queryRaw<{ dia: string; media: number }[]>`
      SELECT date(criadoEm, ${OFFSET_SP}) AS dia, AVG(humor) AS media
      FROM RegistroHumor
      WHERE usuarioId = ${usuarioId}
        AND deletadoEm IS NULL
        AND criadoEm >= ${seteDiasAtras.toISOString()}
      GROUP BY dia
      ORDER BY dia ASC
    `,
    // Distribuição: quantos check-ins de cada humor (1..4) nos últimos 30 dias.
    prisma.$queryRaw<{ humor: number; total: number }[]>`
      SELECT humor, COUNT(*) AS total
      FROM RegistroHumor
      WHERE usuarioId = ${usuarioId}
        AND deletadoEm IS NULL
        AND criadoEm >= ${trintaDiasAtras.toISOString()}
      GROUP BY humor
    `,
    // Humor médio por dia da semana (SP) nos últimos 30 dias — base p/ melhor/pior dia.
    prisma.$queryRaw<{ diaSemana: number; media: number; total: number }[]>`
      SELECT CAST(strftime('%w', criadoEm, ${OFFSET_SP}) AS INTEGER) AS diaSemana,
             AVG(humor) AS media,
             COUNT(*) AS total
      FROM RegistroHumor
      WHERE usuarioId = ${usuarioId}
        AND deletadoEm IS NULL
        AND criadoEm >= ${trintaDiasAtras.toISOString()}
      GROUP BY diaSemana
    `,
  ]);

  // Normaliza a distribuição para sempre conter os 4 níveis (com zero onde faltou):
  // um "0" aqui é informação honesta (não houve aquele humor), não um bug.
  const mapaDistribuicao = new Map(
    distribuicaoRaw.map((d) => [Number(d.humor), Number(d.total)]),
  );
  const distribuicaoHumor30Dias: ContagemHumor[] = [1, 2, 3, 4].map(
    (humor) => ({
      humor,
      total: mapaDistribuicao.get(humor) ?? 0,
    }),
  );

  const humorPorDiaSemana30Dias: HumorPorDiaSemana[] = porDiaSemanaRaw.map(
    (r) => ({
      diaSemana: Number(r.diaSemana),
      media: Number(r.media),
      total: Number(r.total),
    }),
  );

  return {
    totalCheckins,
    diasSeguidos,
    totalEntradasDiario,
    totalSessoesIa,
    mediaHumor7Dias: mediaAgg._avg.humor,
    humorPorDia7Dias: humorPorDia7Dias.map((h) => ({
      dia: h.dia,
      media: Number(h.media),
    })),
    distribuicaoHumor30Dias,
    humorPorDiaSemana30Dias,
  };
}

// Streak isolado: dias consecutivos de check-in. Usado pelo dashboard (/inicio) e
// reaproveitado por obterInsights — uma única fonte de verdade para o cálculo.
export async function obterDiasSeguidos(usuarioId: string): Promise<number> {
  const diasComCheckin = await prisma.$queryRaw<{ dia: string }[]>`
    SELECT DISTINCT date(criadoEm, ${OFFSET_SP}) AS dia
    FROM RegistroHumor
    WHERE usuarioId = ${usuarioId} AND deletadoEm IS NULL
    ORDER BY dia DESC
  `;
  return calcularDiasSeguidos(
    diasComCheckin.map((d) => d.dia),
    new Date(),
  );
}

// Conta dias consecutivos com check-in terminando hoje (ou ontem). Recebe os dias
// distintos (YYYY-MM-DD, fuso SP) em ordem decrescente.
function calcularDiasSeguidos(diasDesc: string[], agora: Date): number {
  if (diasDesc.length === 0) return 0;

  const conjunto = new Set(diasDesc);
  const hoje = diaSP(agora);
  const ontem = diaSP(new Date(agora.getTime() - 24 * 60 * 60 * 1000));

  // O streak vale se houve check-in hoje ou ontem (senão a sequência foi quebrada).
  let cursor: string;
  if (conjunto.has(hoje)) cursor = hoje;
  else if (conjunto.has(ontem)) cursor = ontem;
  else return 0;

  let total = 0;
  while (conjunto.has(cursor)) {
    total += 1;
    cursor = diaAnterior(cursor);
  }
  return total;
}

// "YYYY-MM-DD" no fuso de São Paulo.
function diaSP(data: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);
}

// Dia anterior a uma string "YYYY-MM-DD" (cálculo em UTC, sem ambiguidade de fuso).
function diaAnterior(dia: string): string {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
