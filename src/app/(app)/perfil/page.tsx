import { redirect } from "next/navigation";
import { formatarDataExtenso } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { ApagarConta } from "./ApagarConta";
import { BotaoExportar } from "./BotaoExportar";
import { EditarNome } from "./EditarNome";

export default async function PaginaPerfil() {
  // SEGURANÇA (ADR 0015).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: sessao.usuario.id },
    select: {
      nome: true,
      email: true,
      consentimentoEm: true,
      criadoEm: true,
      plano: { select: { nome: true, limiteMsgIaDia: true } },
    },
  });

  const limite =
    usuario.plano.limiteMsgIaDia === null
      ? "ilimitado"
      : `${usuario.plano.limiteMsgIaDia} mensagens de IA por dia`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Perfil</h1>

      <section className="rounded-2xl bg-superficie p-6 shadow-sm">
        <h2 className="mb-3 font-medium">Seus dados</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-mutado">E-mail</dt>
          <dd>{usuario.email}</dd>
          <dt className="text-mutado">Plano</dt>
          <dd>
            {usuario.plano.nome} ({limite})
          </dd>
          <dt className="text-mutado">Consentimento</dt>
          <dd>{formatarDataExtenso(usuario.consentimentoEm)}</dd>
          <dt className="text-mutado">Conta criada em</dt>
          <dd>{formatarDataExtenso(usuario.criadoEm)}</dd>
        </dl>

        {/* Portabilidade (LGPD): baixa todos os dados do titular em JSON. */}
        <div className="mt-4 border-t border-borda pt-4">
          <BotaoExportar />
        </div>
      </section>

      <section className="rounded-2xl bg-superficie p-6 shadow-sm">
        <h2 className="mb-3 font-medium">Editar nome</h2>
        <EditarNome nomeAtual={usuario.nome} />
      </section>

      <section className="rounded-2xl border border-red-200 bg-superficie p-6 shadow-sm dark:border-red-500/30">
        <h2 className="mb-3 font-medium text-red-700 dark:text-red-400">
          Apagar minha conta
        </h2>
        <ApagarConta />
      </section>
    </div>
  );
}
