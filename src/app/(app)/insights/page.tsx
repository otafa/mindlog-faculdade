import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EstadoVazio } from "@/components/EstadoVazio";
import { obterInsights } from "@/lib/insights";
import { lerSessao } from "@/lib/session";

// Mínimo de check-ins para os insights fazerem sentido (média/streak/gráfico de 7 dias).
const MIN_CHECKINS = 3;

// Escala de humor (mesma do check-in): valor 1..4 → rótulo + emoji.
const ESCALA_HUMOR = [
  { valor: 1, rotulo: "Mal", emoji: "😣" },
  { valor: 2, rotulo: "Neutro", emoji: "😐" },
  { valor: 3, rotulo: "Bem", emoji: "🙂" },
  { valor: 4, rotulo: "Muito bem", emoji: "😄" },
];

function Card({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-superficie p-5 shadow-sm">
      <p className="font-serif text-2xl font-semibold text-roxo">{valor}</p>
      <p className="mt-1 text-sm text-suave">{rotulo}</p>
    </div>
  );
}

export default async function PaginaInsights() {
  // SEGURANÇA (ADR 0015).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const insights = await obterInsights(sessao.usuario.id);

  // Dados insuficientes: evita mostrar zeros/"—" que parecem bug. Mostra um convite
  // honesto a fazer check-ins, com atalho para a ação.
  if (insights.totalCheckins < MIN_CHECKINS) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Seus insights</h1>
        <EstadoVazio
          Icone={ChartLineUp}
          titulo="Seus padrões aparecem aqui"
          descricao="Continue fazendo check-ins por alguns dias para ver seu humor ao longo do tempo."
          acao={
            <Link
              href="/checkin"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-roxo px-5 font-medium text-white transition-colors hover:bg-roxo/90"
            >
              Fazer check-in
            </Link>
          }
        />
      </div>
    );
  }

  const media =
    insights.mediaHumor7Dias === null
      ? "—"
      : insights.mediaHumor7Dias.toFixed(1).replace(".", ",");

  // Layout do gráfico SVG (barras = média de humor por dia, escala 1–4).
  const dados = insights.humorPorDia7Dias;
  const LARGURA = 280;
  const ALTURA = 120;
  const BASE = 100; // linha de base das barras
  const ALTURA_MAX = 80; // altura para humor = 4
  const larguraBarra = dados.length > 0 ? LARGURA / dados.length : 0;

  // Distribuição (30 dias): total e maior contagem (para escalar as barras).
  const totalDistribuicao = insights.distribuicaoHumor30Dias.reduce(
    (soma, d) => soma + d.total,
    0,
  );
  const maxDistribuicao = Math.max(
    1,
    ...insights.distribuicaoHumor30Dias.map((d) => d.total),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Seus insights</h1>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          rotulo="Dias seguidos de check-in"
          valor={String(insights.diasSeguidos)}
        />
        <Card rotulo="Humor médio (7 dias)" valor={media} />
        <Card
          rotulo="Entradas no diário"
          valor={String(insights.totalEntradasDiario)}
        />
        <Card
          rotulo="Conversas com a IA"
          valor={String(insights.totalSessoesIa)}
        />
      </section>

      <section className="rounded-2xl bg-superficie p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Humor nos últimos 7 dias</h2>
        {dados.length === 0 ? (
          <p className="text-sm text-mutado">
            Faça check-ins para ver seu humor ao longo dos dias.
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            className="h-40 w-full"
            role="img"
            aria-label="Gráfico de barras do humor médio por dia"
          >
            {dados.map((d, i) => {
              const altura = (d.media / 4) * ALTURA_MAX;
              const x = i * larguraBarra + larguraBarra * 0.2;
              const largura = larguraBarra * 0.6;
              const [, mes, dia] = d.dia.split("-");
              return (
                <g key={d.dia}>
                  <rect
                    x={x}
                    y={BASE - altura}
                    width={largura}
                    height={altura}
                    rx={3}
                    className="fill-roxo"
                  />
                  <text
                    x={x + largura / 2}
                    y={BASE + 14}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-mutado"
                  >
                    {dia}/{mes}
                  </text>
                  <text
                    x={x + largura / 2}
                    y={BASE - altura - 4}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-suave"
                  >
                    {d.media.toFixed(1).replace(".", ",")}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </section>

      {/* Distribuição dos humores (30 dias): barras horizontais por nível. */}
      <section className="rounded-2xl bg-superficie p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Como você esteve</h2>
        <p className="mb-4 text-sm text-mutado">
          Distribuição nos últimos 30 dias
        </p>
        {totalDistribuicao === 0 ? (
          <p className="text-sm text-mutado">
            Sem check-ins nos últimos 30 dias. Que tal registrar como você está
            hoje?
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ESCALA_HUMOR.map((op) => {
              const item = insights.distribuicaoHumor30Dias.find(
                (d) => d.humor === op.valor,
              );
              const total = item?.total ?? 0;
              const pctBarra = (total / maxDistribuicao) * 100;
              const pctTotal = Math.round((total / totalDistribuicao) * 100);
              return (
                <li key={op.valor} className="flex items-center gap-3">
                  <span className="flex w-28 shrink-0 items-center gap-2 text-sm">
                    <span aria-hidden>{op.emoji}</span>
                    {op.rotulo}
                  </span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-lavanda">
                    <span
                      className="block h-full rounded-full bg-roxo"
                      style={{ width: `${pctBarra}%` }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-sm text-suave">
                    {total} ({pctTotal}%)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
