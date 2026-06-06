import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

// Script anti-flash (FOUC): roda ANTES da primeira pintura. Lê o cookie `tema`; se não
// houver, cai na preferência do sistema (prefers-color-scheme). Define a classe `dark`
// no <html> de forma síncrona, evitando o "piscar" de tema errado no carregamento.
const SCRIPT_TEMA = `(function(){try{var m=document.cookie.match(/(?:^|; )tema=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;var d=t?t==='escuro':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindLog",
  description:
    "Seu diário emocional: check-in de humor, diário e apoio diário.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Tema inicial no SSR a partir do cookie: para quem já escolheu, zero flash sem
  // depender do script. Quem nunca escolheu fica sem a classe aqui e o script resolve
  // pela preferência do sistema (por isso o suppressHydrationWarning no <html>).
  const tema = (await cookies()).get("tema")?.value;
  const escuroInicial = tema === "escuro";

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} h-full antialiased${
        escuroInicial ? " dark" : ""
      }`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        {children}
      </body>
    </html>
  );
}
