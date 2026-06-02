import { sair } from "@/app/(auth)/logout/actions";

// Botão de logout. Usa form + Server Action (não link), porque logout muda estado no
// servidor (apaga a sessão). Renderizado no cabeçalho do layout autenticado.
export function BotaoSair() {
  return (
    <form action={sair}>
      <button type="submit" style={{ minHeight: 44 }}>
        Sair
      </button>
    </form>
  );
}
