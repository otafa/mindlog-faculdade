import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/BotaoSair";
import { lerSessao } from "@/lib/session";

// Itens de navegação. Algumas rotas ainda não existem (serão criadas ao longo da Fase 3);
// até lá, o link leva a um 404. Conforme cada tela é construída, ela entra no grupo (app)
// e passa a ser protegida por este mesmo layout.
const NAV = [
  { href: "/", rotulo: "Início" },
  { href: "/checkin", rotulo: "Check-in" },
  { href: "/diario", rotulo: "Diário" },
  { href: "/chat", rotulo: "IA" },
  { href: "/insights", rotulo: "Insights" },
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
    <div className="flex min-h-full flex-col bg-[#F5F3FF] text-zinc-900">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-[#6C5CE7]">
          MindLog
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">Olá, {sessao.usuario.nome}</span>
          <BotaoSair />
        </div>
      </header>

      <div className="flex flex-1">
        <nav
          aria-label="Navegação principal"
          className="hidden w-48 shrink-0 border-r border-black/5 p-4 sm:block"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-white"
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
