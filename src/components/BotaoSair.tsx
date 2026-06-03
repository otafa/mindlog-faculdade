import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { sair } from "@/app/(auth)/logout/actions";

// Botão de logout. Usa form + Server Action (não link), porque logout muda estado no
// servidor (apaga a sessão). Renderizado no rodapé da sidebar do layout autenticado.
export function BotaoSair() {
  return (
    <form action={sair}>
      <button
        type="submit"
        className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600"
      >
        <SignOut size={18} weight="bold" />
        Sair
      </button>
    </form>
  );
}
