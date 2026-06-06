import { EXERCICIOS } from "@/data/exercicios";

// Conteúdo estático (sem banco). O layout autenticado (ADR 0015) já protege a rota.
export default function PaginaExercicios() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Exercícios</h1>
        <p className="mt-1 text-sm text-suave">
          Práticas curtas para momentos de pausa. Vá no seu ritmo.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        {EXERCICIOS.map((ex) => (
          <article
            key={ex.id}
            className="rounded-2xl bg-superficie p-5 shadow-sm"
          >
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="font-medium text-roxo">{ex.titulo}</h2>
              <span className="shrink-0 text-xs text-mutado">{ex.duracao}</span>
            </header>
            <p className="mt-2 font-serif text-sm text-suave">{ex.descricao}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
