import { redirect } from "next/navigation";
import { obterInsights } from "@/lib/insights";
import { lerSessao } from "@/lib/session";

function Card({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-2xl font-semibold text-roxo">{valor}</p>
      <p className="mt-1 text-sm text-zinc-600">{rotulo}</p>
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
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

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Humor nos últimos 7 dias</h2>
        {dados.length === 0 ? (
          <p className="text-sm text-zinc-500">
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
                    fill="#71717a"
                  >
                    {dia}/{mes}
                  </text>
                  <text
                    x={x + largura / 2}
                    y={BASE - altura - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#3f3f46"
                  >
                    {d.media.toFixed(1).replace(".", ",")}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </section>
    </div>
  );
}
