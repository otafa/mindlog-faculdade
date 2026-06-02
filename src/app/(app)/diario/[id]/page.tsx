import { notFound, redirect } from "next/navigation";
import { descriptografar } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { atualizarEntrada } from "../actions";
import { EditorEntrada } from "../EditorEntrada";

export default async function PaginaEditarEntrada({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // SEGURANÇA (ADR 0015): valida sessão.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const { id } = await params;

  // Só carrega se a entrada for do próprio usuário e não estiver apagada.
  const entrada = await prisma.entradaDiario.findFirst({
    where: { id, usuarioId: sessao.usuario.id, deletadoEm: null },
    select: { id: true, conteudo: true },
  });
  if (!entrada) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Editar entrada</h1>
        <EditorEntrada
          acao={atualizarEntrada}
          id={entrada.id}
          conteudoInicial={descriptografar(entrada.conteudo)}
          rotuloBotao="Salvar alterações"
        />
      </section>
    </div>
  );
}
