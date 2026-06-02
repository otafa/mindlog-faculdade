import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/BotaoSair";
import { lerSessao } from "@/lib/session";

// Itens de navegação da área autenticada (todas as rotas existem e são protegidas
// por este layout).
const NAV = [
  { href: "/", rotulo: "Início" },
  { href: "/checkin", rotulo: "Check-in" },
  { href: "/diario", rotulo: "Diário" },
  { href: "/chat", rotulo: "IA" },
  { href: "/insights", rotulo: "Insights" },
  { href: "/comunidade", rotulo: "Comunidade" },
  { href: "/exercicios", rotulo: "Exercícios" },
  { href: "/suporte", rotulo: "Suporte" },
  { href: "/perfil", rotulo: "Perfil" },
];

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
    <div className="flex min-h-full flex-col bg-lavanda text-zinc-900">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-roxo">
          MindLog
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">
            Olá, {sessao.usuario.nome}
          </span>
          <BotaoSair />
        </div>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Mobile: barra rolável no topo. Desktop (sm+): menu lateral. */}
        <nav
          aria-label="Navegação principal"
          className="border-b border-black/5 sm:w-48 sm:shrink-0 sm:border-r sm:border-b-0"
        >
          <ul className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible sm:p-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-sm whitespace-nowrap hover:bg-white"
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
