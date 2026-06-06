"use client";

import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// Sistema de toasts próprio (sem dependência externa): um provider guarda a fila e
// expõe `mostrar()`; a região visual fica fixa no rodapé e é anunciável por leitor de
// tela (aria-live). NÃO altera nenhuma lógica de ação — é só feedback visual.

type Tipo = "sucesso" | "erro";
type Toast = { id: number; tipo: Tipo; texto: string };

const DURACAO_MS = 4000;

const ToastContext = createContext<{
  mostrar: (texto: string, tipo?: Tipo) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(0);

  const remover = useCallback((id: number) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (texto: string, tipo: Tipo = "sucesso") => {
      const id = (proximoId.current += 1);
      setToasts((atual) => [...atual, { id, tipo, texto }]);
      // Auto-dismiss; o usuário também pode fechar no X.
      setTimeout(() => remover(id), DURACAO_MS);
    },
    [remover],
  );

  return (
    <ToastContext.Provider value={{ mostrar }}>
      {children}

      {/* Região viva: novos toasts são anunciados sem roubar o foco. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => {
          const Icone = t.tipo === "sucesso" ? CheckCircle : WarningCircle;
          return (
            <div
              key={t.id}
              role={t.tipo === "erro" ? "alert" : "status"}
              className="toast-item pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-borda bg-superficie p-4 shadow-lg"
            >
              <Icone
                size={22}
                weight="fill"
                className={
                  t.tipo === "sucesso"
                    ? "shrink-0 text-green-600"
                    : "shrink-0 text-red-600"
                }
              />
              <p className="flex-1 text-sm text-conteudo">{t.texto}</p>
              <button
                type="button"
                onClick={() => remover(t.id)}
                aria-label="Fechar notificação"
                className="shrink-0 rounded-md text-mutado transition-colors hover:text-conteudo"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
