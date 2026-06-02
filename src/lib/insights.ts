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

export type Insights = {
  diasSeguidos: number;
  totalEntradasDiario: number;
  totalSessoesIa: number;
  mediaHumor7Dias: number | null;
  humorPorDia7Dias: HumorPorDia[];
};

export async function obterInsights(usuarioId: string): Promise<Insights> {
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    mediaAgg,
    totalEntradasDiario,
    totalSessoesIa,
    diasComCheckin,
    humorPorDia7Dias,
  ] = await Promise.all([
    // Média do humor (AVG) na janela móvel dos últimos 7 dias.
    prisma.registroHumor.aggregate({
      _avg: { humor: true },
      where: { usuarioId, deletadoEm: null, criadoEm: { gte: seteDiasAtras } },
    }),
    // Contagem de entradas de diário ativas.
    prisma.entradaDiario.count({ where: { usuarioId, deletadoEm: null } }),
    // Contagem de conversas com a IA (0 até o chat existir).
    prisma.sessaoChat.count({ where: { usuarioId, deletadoEm: null } }),
    // Dias (no fuso SP) com pelo menos um check-in — base para o streak.
    prisma.$queryRaw<{ dia: string }[]>`
      SELECT DISTINCT date(criadoEm, ${OFFSET_SP}) AS dia
      FROM RegistroHumor
      WHERE usuarioId = ${usuarioId} AND deletadoEm IS NULL
      ORDER BY dia DESC
    `,
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
  ]);

  return {
    diasSeguidos: calcularDiasSeguidos(
      diasComCheckin.map((d) => d.dia),
      agora,
    ),
    totalEntradasDiario,
    totalSessoesIa,
    mediaHumor7Dias: mediaAgg._avg.humor,
    humorPorDia7Dias: humorPorDia7Dias.map((h) => ({
      dia: h.dia,
      media: Number(h.media),
    })),
  };
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
