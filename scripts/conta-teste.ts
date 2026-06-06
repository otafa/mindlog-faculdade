// Utilitário de DESENVOLVIMENTO: cria (ou remove) uma conta de teste LIMPA, separada
// da sua conta real, para visualizar os estados vazios sem tocar nos seus dados.
//
// É ADITIVO: cria um usuário novo (e-mail dedicado). Não altera nem apaga seus dados.
//
//   Criar:    npx tsx --env-file=.env scripts/conta-teste.ts
//   Povoar:   npx tsx --env-file=.env scripts/conta-teste.ts popular
//   Remover:  npx tsx --env-file=.env scripts/conta-teste.ts remover
//
// Sem argumento a conta fica VAZIA (/diario, /chat e /insights mostram o estado vazio).
// `popular` semeia check-ins em datas variadas dos últimos 30 dias — só na conta de
// teste — para ver os insights POPULADOS (distribuição, dias da semana, streak). A
// /comunidade é um feed GLOBAL: só fica vazia quando não há NENHUM post de ninguém.

import { hashSenha } from "@/lib/auth";
import { prisma } from "@/lib/db";

const EMAIL = "teste-vazio@local";
const SENHA = "teste1234";

// Garante a conta de teste e devolve seu id (upsert idempotente).
async function garantirConta(): Promise<string> {
  const senhaHash = await hashSenha(SENHA);
  const usuario = await prisma.usuario.upsert({
    where: { email: EMAIL },
    update: { deletadoEm: null },
    create: {
      nome: "Conta de teste",
      email: EMAIL,
      senhaHash,
      consentimentoEm: new Date(),
    },
    select: { id: true },
  });
  return usuario.id;
}

// Semeia check-ins em datas passadas (somente na conta de teste). Idempotente: apaga
// os check-ins anteriores da conta antes de inserir. Humor varia por dia da semana
// (fins de semana melhores, segundas piores) para os padrões ficarem visíveis. Os 3
// dias mais recentes (hoje, ontem, anteontem) garantem um streak > 1.
async function popular(usuarioId: string) {
  await prisma.registroHumor.deleteMany({ where: { usuarioId } });

  // 12:00 SP = 15:00 UTC: evita cruzar a borda do dia ao agrupar por fuso.
  const hoje = new Date();
  const baseUtc = Date.UTC(
    hoje.getUTCFullYear(),
    hoje.getUTCMonth(),
    hoje.getUTCDate(),
    15,
  );

  const offsets = [0, 1, 2, 4, 6, 7, 9, 11, 13, 15, 16, 18, 20, 22, 25, 27, 29];
  const dados = offsets.map((off) => {
    const criadoEm = new Date(baseUtc - off * 86_400_000);
    const diaSemana = criadoEm.getUTCDay(); // 0=Dom .. 6=Sáb
    // Padrão simples: fim de semana melhor (4), segunda pior (1), resto no meio.
    let humor = 2;
    if (diaSemana === 0 || diaSemana === 6) humor = 4;
    else if (diaSemana === 1) humor = 1;
    else if (diaSemana === 5) humor = 3;
    return { usuarioId, humor, criadoEm };
  });

  for (const d of dados) {
    await prisma.registroHumor.create({ data: d });
  }

  console.log(`Semeados ${dados.length} check-ins na conta de teste.`);
}

async function main() {
  const modo = process.argv[2];

  if (modo === "remover") {
    const r = await prisma.usuario.deleteMany({ where: { email: EMAIL } });
    console.log(
      r.count > 0
        ? `Conta de teste removida (${EMAIL}).`
        : "Nada a remover (conta de teste não existe).",
    );
    return;
  }

  const usuarioId = await garantirConta();

  if (modo === "popular") {
    await popular(usuarioId);
  }

  console.log("Conta de teste pronta. Entre em /login com:");
  console.log(`  e-mail: ${EMAIL}`);
  console.log(`  senha : ${SENHA}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
