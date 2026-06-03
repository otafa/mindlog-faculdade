"use client";

import {
  Barbell,
  ChartBar,
  Headset,
  House,
  type Icon,
  PencilSimple,
  Robot,
  Smiley,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; rotulo: string; Icone: Icon }[] = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/checkin", rotulo: "Check-in", Icone: Smiley },
  { href: "/diario", rotulo: "Diário", Icone: PencilSimple },
  { href: "/comunidade", rotulo: "Comunidade", Icone: UsersThree },
  { href: "/chat", rotulo: "IA", Icone: Robot },
  { href: "/insights", rotulo: "Insights", Icone: ChartBar },
  { href: "/exercicios", rotulo: "Exercícios", Icone: Barbell },
  { href: "/suporte", rotulo: "Suporte", Icone: Headset },
  { href: "/perfil", rotulo: "Perfil", Icone: User },
];

export function MenuNav() {
  const pathname = usePathname();

  return (
    <ul className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible sm:p-3">
      {NAV.map(({ href, rotulo, Icone }) => {
        const ativo =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-full px-3 text-sm whitespace-nowrap ${
                ativo
                  ? "bg-roxo font-medium text-white"
                  : "text-zinc-700 hover:bg-white"
              }`}
            >
              <Icone size={20} weight={ativo ? "fill" : "regular"} />
              {rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
