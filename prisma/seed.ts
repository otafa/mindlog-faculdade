// Seed dos planos do MindLog.
//
// Idempotente: usa upsert, então pode rodar quantas vezes for preciso sem duplicar.
// Roda automaticamente após `prisma migrate reset` (configurado em prisma.config.ts),
// garantindo que os 3 planos existam sempre que o banco for recriado do zero.

import { prisma } from "@/lib/db";

const planos = [
  {
    id: "semente",
    nome: "Semente",
    limiteMsgIaDia: 40,
    descricao:
      "Plano gratuito básico para começar: check-in, diário e até 40 mensagens com a IA por dia.",
  },
  {
    id: "equilibrio",
    nome: "Equilíbrio",
    limiteMsgIaDia: null,
    descricao:
      "Uso intermediário: mensagens com a IA ilimitadas e acompanhamento contínuo do humor.",
  },
  {
    id: "florescer",
    nome: "Florescer",
    limiteMsgIaDia: null,
    descricao: "Uso completo: todos os recursos liberados, sem limites de uso.",
  },
];

async function main() {
  for (const plano of planos) {
    const resultado = await prisma.plano.upsert({
      where: { id: plano.id },
      update: plano,
      create: plano,
    });
    console.log(
      `✓ Plano "${resultado.nome}" (${resultado.id}) criado/atualizado.`,
    );
  }
  console.log(`Seed concluído: ${planos.length} planos.`);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
