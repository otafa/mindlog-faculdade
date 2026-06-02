import { FAQ } from "@/data/suporte";

// Conteúdo estático (sem banco). "Suporte" está no menu, então o CVV 188 fica a
// no máximo 2 cliques de qualquer tela autenticada (1 clique no menu + esta página).
export default function PaginaSuporte() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Suporte</h1>

      {/* CVV em destaque — apoio em momentos de crise. */}
      <section className="rounded-xl border border-roxo/30 bg-lavanda p-5">
        <h2 className="font-medium">Precisa conversar agora?</h2>
        <p className="mt-1 text-sm text-zinc-700">
          O CVV (Centro de Valorização da Vida) oferece apoio emocional gratuito
          e sigiloso, 24 horas por dia.
        </p>
        <p className="mt-3 flex flex-wrap gap-4 text-sm">
          <a href="tel:188" className="font-semibold text-roxo underline">
            Ligar 188
          </a>
          <a
            href="https://www.cvv.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-roxo underline"
          >
            cvv.org.br
          </a>
        </p>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-medium">Outros canais</h2>
        <ul className="flex flex-col gap-1 text-sm text-zinc-700">
          <li>
            E-mail:{" "}
            <a
              href="mailto:suporte@mindlog.exemplo"
              className="text-roxo underline"
            >
              suporte@mindlog.exemplo
            </a>
          </li>
          <li>Chat com a equipe: em breve (projeto acadêmico).</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Perguntas frequentes</h2>
        {FAQ.map((item) => (
          <article
            key={item.pergunta}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-medium text-zinc-800">
              {item.pergunta}
            </h3>
            <p className="mt-1 font-serif text-sm text-zinc-600">
              {item.resposta}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
