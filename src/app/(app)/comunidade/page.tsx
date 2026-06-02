import { redirect } from "next/navigation";
import { formatarDataHora } from "@/lib/datas";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/session";
import { alternarCurtida } from "./actions";
import { FormularioPost } from "./FormularioPost";

export default async function PaginaComunidade() {
  // SEGURANÇA (ADR 0015).
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { deletadoEm: null },
    orderBy: { criadoEm: "desc" },
    take: 50,
    select: {
      id: true,
      conteudo: true,
      criadoEm: true,
      usuario: { select: { nome: true } },
      _count: { select: { curtidas: true } },
      // só as curtidas do usuário atual, para saber se ele já curtiu este post
      curtidas: { where: { usuarioId: sessao.usuario.id }, select: { usuarioId: true } },
    },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Comunidade</h1>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <FormularioPost />
      </section>

      <section className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não há posts. Seja o primeiro a compartilhar.
          </p>
        ) : (
          posts.map((post) => {
            const curtido = post.curtidas.length > 0;
            return (
              <article key={post.id} className="rounded-xl bg-white p-4 shadow-sm">
                <header className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">{post.usuario.nome}</span>
                  <span>{formatarDataHora(post.criadoEm)}</span>
                </header>
                <p className="whitespace-pre-wrap text-sm text-zinc-800">{post.conteudo}</p>
                <form action={alternarCurtida} className="mt-3">
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    aria-pressed={curtido}
                    className={`text-sm ${curtido ? "text-[#6C5CE7]" : "text-zinc-500"}`}
                  >
                    {curtido ? "♥" : "♡"} {post._count.curtidas}
                  </button>
                </form>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
