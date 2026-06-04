// Utilitário de DESENVOLVIMENTO: cria (ou remove) uma conta de teste LIMPA, separada
// da sua conta real, para visualizar os estados vazios sem tocar nos seus dados.
//
// É ADITIVO: cria um usuário novo (e-mail dedicado). Não altera nem apaga seus dados.
//
//   Criar:   npx tsx --env-file=.env scripts/conta-teste.ts
//   Remover: npx tsx --env-file=.env scripts/conta-teste.ts remover
//
// A conta de teste não tem check-ins, diário, chat nem posts — então /diario, /chat
// e /insights aparecem vazios. A /comunidade é um feed GLOBAL: só fica vazia quando
// não há NENHUM post de ninguém (ver opção reversível no README desta tarefa).

import { hashSenha } from "@/lib/auth";
import { prisma } from "@/lib/db";

const EMAIL = "teste-vazio@local";
const SENHA = "teste1234";

async function main() {
  const remover = process.argv[2] === "remover";

  if (remover) {
    const r = await prisma.usuario.deleteMany({ where: { email: EMAIL } });
    console.log(
      r.count > 0
        ? `Conta de teste removida (${EMAIL}).`
        : "Nada a remover (conta de teste não existe).",
    );
    return;
  }

  const senhaHash = await hashSenha(SENHA);
  await prisma.usuario.upsert({
    where: { email: EMAIL },
    update: { deletadoEm: null },
    create: {
      nome: "Conta de teste",
      email: EMAIL,
      senhaHash,
      consentimentoEm: new Date(),
    },
  });

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
