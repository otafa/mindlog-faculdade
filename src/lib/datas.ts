// Helpers de data/fuso.
//
// ADR 0011: DateTime é armazenado em UTC; a conversão para America/Sao_Paulo acontece
// na borda de exibição/agregação. Estes helpers centralizam essa conversão.

export const FUSO = "America/Sao_Paulo";

// Ex.: "domingo, 1 de junho de 2026".
export function formatarDataExtenso(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(data);
}

// Ex.: "1 de junho de 2026, 14:30".
export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

// Saudação conforme a hora local em São Paulo.
export function saudacaoPorHorario(data: Date): string {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO,
      hour: "2-digit",
      hourCycle: "h23", // 00–23, evita "24" à meia-noite
    }).format(data),
  );

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
