import Link from "next/link";
import { redirect } from "next/navigation";
import { formatarDataExtenso } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { ApagarConta } from "./ApagarConta";
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Perfil</h1>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-medium">Seus dados</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-zinc-500">E-mail</dt>
          <dd>{usuario.email}</dd>
          <dt className="text-zinc-500">Plano</dt>
          <dd>
            {usuario.plano.nome} ({limite})
          </dd>
          <dt className="text-zinc-500">Consentimento</dt>
          <dd>{formatarDataExtenso(usuario.consentimentoEm)}</dd>
          <dt className="text-zinc-500">Conta criada em</dt>
          <dd>{formatarDataExtenso(usuario.criadoEm)}</dd>
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-medium">Editar nome</h2>
        <EditarNome nomeAtual={usuario.nome} />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-medium">Seus direitos (LGPD)</h2>
        <p className="mb-3 text-sm text-zinc-600">
          Você pode baixar todos os seus dados em formato legível
          (portabilidade).
        </p>
        <Link
          href="/perfil/exportar"
          prefetch={false}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-roxo px-4 font-medium text-white"
        >
          Exportar meus dados (JSON)
        </Link>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-medium text-red-700">Apagar minha conta</h2>
        <ApagarConta />
      </section>
    </div>
  );
}
