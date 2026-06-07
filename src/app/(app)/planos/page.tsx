import { CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { BotaoEscolherPlano } from "./BotaoEscolherPlano";

// Ordem de exibição dos planos (do mais simples ao mais completo).
const ORDEM = ["semente", "equilibrio", "florescer"];

// Apresentação (NÃO está no banco): preço e benefícios são ilustrativos — o projeto
// não tem cobrança (ADR 0004). O LIMITE de IA, esse sim, vem do banco (limiteMsgIaDia).
const APRESENTACAO: Record<
  string,
  { preco: string; beneficios: string[]; popular?: boolean }
> = {
  semente: {
    preco: "Grátis",
    beneficios: [
      "Check-in de humor diário",
      "Diário pessoal com histórico",
      "Insights de humor",
    ],
  },
  equilibrio: {
    preco: "R$ 19,90/mês",
    popular: true,
    beneficios: [
      "Tudo do Semente",
      "Acompanhamento contínuo do humor",
      "Exercícios de bem-estar",
    ],
  },
  florescer: {
    preco: "R$ 49,90/mês",
    beneficios: [
      "Tudo do Equilíbrio",
      "Todos os recursos liberados",
      "Prioridade em novidades",
    ],
  },
};

// Frase do limite de IA a partir do dado REAL do banco (não hardcode).
function beneficioIa(limiteMsgIaDia: number | null): string {
  return limiteMsgIaDia === null
    ? "Mensagens com a IA ilimitadas"
    : `Até ${limiteMsgIaDia} mensagens com a IA por dia`;
}

export default async function PaginaPlanos() {
  // SEGURANÇA (ADR 0015).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  // Planos vêm do banco (somente leitura); ordenados pela ORDEM definida acima.
  const planos = await prisma.plano.findMany();
  planos.sort((a, b) => ORDEM.indexOf(a.id) - ORDEM.indexOf(b.id));

  const planoAtual = sessao.usuario.planoId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Planos</h1>
        <p className="mt-1 text-sm text-suave">
          Escolha o plano que combina com o seu momento.
        </p>
      </div>

      {/* Honestidade de escopo (ADR 0004 + nova ADR): sem pagamento de verdade. */}
      <p className="rounded-xl bg-roxo/10 px-4 py-3 text-sm text-suave">
        Projeto acadêmico: a troca de plano é{" "}
        <strong>imediata e sem cobrança</strong> — não há gateway de pagamento.
        Os preços são apenas ilustrativos.
      </p>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {planos.map((plano) => {
          const apres = APRESENTACAO[plano.id];
          const ehAtual = plano.id === planoAtual;
          const beneficios = [
            beneficioIa(plano.limiteMsgIaDia),
            ...(apres?.beneficios ?? []),
          ];

          return (
            <div
              key={plano.id}
              className={`relative flex flex-col rounded-2xl bg-superficie p-6 shadow-sm ${
                apres?.popular ? "ring-2 ring-roxo" : ""
              }`}
            >
              {apres?.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-roxo px-3 py-0.5 text-xs font-medium text-white">
                  MAIS POPULAR
                </span>
              )}

              <h2 className="font-serif text-lg font-semibold text-roxo">
                {plano.nome}
              </h2>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {apres?.preco ?? "—"}
              </p>

              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                {beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-roxo"
                    />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {ehAtual ? (
                  <p className="flex items-center justify-center gap-2 rounded-xl bg-roxo/10 py-2.5 text-sm font-medium text-roxo">
                    <Sparkle size={16} weight="fill" />
                    Seu plano atual
                  </p>
                ) : (
                  <BotaoEscolherPlano
                    planoId={plano.id}
                    destaque={apres?.popular}
                  />
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
