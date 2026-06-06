import { UsersThree } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { EstadoVazio } from "@/components/EstadoVazio";
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
      curtidas: {
        where: { usuarioId: sessao.usuario.id },
        select: { usuarioId: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Comunidade</h1>

      <section className="rounded-2xl bg-superficie p-4 shadow-sm">
        <FormularioPost />
      </section>

      <section className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <EstadoVazio
            Icone={UsersThree}
            titulo="A comunidade está quietinha por aqui"
            descricao="Seja a primeira pessoa a compartilhar algo hoje — é só escrever no campo acima."
          />
        ) : (
          posts.map((post) => {
            const curtido = post.curtidas.length > 0;
            return (
              <article
                key={post.id}
                className="rounded-2xl bg-superficie p-4 shadow-sm"
              >
                <header className="mb-2 flex items-center justify-between text-xs text-mutado">
                  <span className="font-medium text-suave">
                    {post.usuario.nome}
                  </span>
                  <span>{formatarDataHora(post.criadoEm)}</span>
                </header>
                <p className="font-serif text-sm whitespace-pre-wrap text-conteudo">
                  {post.conteudo}
                </p>
                <form action={alternarCurtida} className="mt-3">
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    aria-pressed={curtido}
                    aria-label={curtido ? "Descurtir post" : "Curtir post"}
                    className={`flex min-h-[44px] items-center text-sm ${curtido ? "text-roxo" : "text-mutado"}`}
                  >
                    <span aria-hidden>{curtido ? "♥" : "♡"}</span>
                    <span className="ml-1">{post._count.curtidas}</span>
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
