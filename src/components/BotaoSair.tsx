import { sair } from "@/app/(auth)/logout/actions";

// Botão de logout. Usa form + Server Action (não link), porque logout muda estado no
// servidor (apaga a sessão).
// TODO Fase 3: mover para o layout autenticado (dashboard), junto da navegação.
export function BotaoSair() {
  return (
    <form action={sair}>
      <button type="submit" style={{ minHeight: 44 }}>
        Sair
      </button>
    </form>
  );
}
