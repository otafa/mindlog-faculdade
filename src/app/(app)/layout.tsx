import { Brain } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/BotaoSair";
import { MenuNav } from "@/components/MenuNav";
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
    <div className="flex min-h-full flex-col bg-lavanda text-zinc-900 sm:flex-row">
      {/* Sidebar: marca no topo, navegação no meio, "Sair" no rodapé.
          Mobile: vira um bloco no topo com a nav rolável. */}
      <aside className="flex flex-col border-b border-black/5 bg-white sm:min-h-screen sm:w-56 sm:shrink-0 sm:border-r sm:border-b-0">
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
        <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="text-lg font-semibold">Olá, {sessao.usuario.nome}</p>
        </header>

        <main className="flex-1 px-4 pb-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
