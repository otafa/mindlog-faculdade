import { Brain, User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/BotaoSair";
import { MenuNav } from "@/components/MenuNav";
import { capitalizarPrimeira, formatarDataExtenso } from "@/lib/datas";
import { lerSessao } from "@/lib/session";

export default async function LayoutAutenticado({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // SEGURANÇA (carry-forward da Fase 2 — ADR 0015): o proxy só checa a PRESENÇA do cookie.
  // A validação real (token existe, não expirou, usuário não soft-deletado) é aqui. Sem
  // sessão válida, redireciona para /login.
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-lavanda text-zinc-900 sm:flex-row">
      {/* Sidebar: marca no topo, navegação no meio, "Sair" no rodapé.
          Mobile: vira um bloco no topo com a nav rolável. */}
      <aside className="flex flex-col border-b border-black/5 bg-white sm:w-56 sm:shrink-0 sm:border-r sm:border-b-0">
        <Link href="/" className="flex items-center gap-2 px-4 py-4">
          <Brain size={28} weight="duotone" className="text-roxo" />
          <span className="font-serif text-lg font-semibold text-roxo">
            MindLog
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="sm:flex-1">
          <MenuNav />
        </nav>

        <div className="border-t border-black/5 p-2 sm:p-3">
          <BotaoSair />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Barra de topo: conteúdo alinhado ao mesmo container do conteúdo (Gestalt). */}
        <header className="px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">
                Olá, {sessao.usuario.nome}
              </p>
              <p className="text-sm text-zinc-500">
                {capitalizarPrimeira(formatarDataExtenso(new Date()))}
              </p>
            </div>
            <Link
              href="/perfil"
              aria-label="Abrir perfil"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-roxo text-white"
            >
              <User size={22} weight="fill" />
            </Link>
          </div>
        </header>

        {/* Conteúdo ancorado: container centralizado, largura máxima confortável e respiro. */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-2 pb-10 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
