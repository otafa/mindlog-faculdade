// IA mockada (ADR 0004): nenhuma chamada a API externa de LLM. As respostas vêm de
// regras simples por palavra-chave e de uma rotação de frases de escuta ativa.
//
// Tom (briefing): acolhedor, sem positividade tóxica, honesto sobre os limites — a IA
// não substitui um profissional. Mensagens com sinais de crise apontam para o CVV (188).

type Regra = { padrao: RegExp; respostas: string[] };

// Sinais de crise: priorizados sobre qualquer outra regra.
const PADRAO_CRISE =
  /(suic[íi]|me matar|tirar minha vida|n[ãa]o quero (mais )?viver|me machucar|automutila|acabar com tudo)/;

const RESPOSTA_CRISE =
  "Sinto muito que você esteja passando por algo tão pesado — e fico feliz que tenha colocado isso em palavras. " +
  "Se você está pensando em se machucar, por favor procure ajuda agora: ligue para o CVV no 188 (24h, gratuito e sigiloso) " +
  "ou acesse cvv.org.br. Se puder, me conte um pouco mais do que está acontecendo; estou aqui para ouvir.";

const REGRAS: Regra[] = [
  {
    padrao: /(ansios|nervos|medo|preocupad|p[âa]nico|afli)/,
    respostas: [
      "Parece que a ansiedade está pesada agora. O que costuma passar pela sua cabeça nesses momentos?",
      "Faz sentido se sentir assim. Quer tentar descrever o que está te deixando mais apreensivo?",
    ],
  },
  {
    padrao: /(triste|pra baixo|deprimid|desanim|vazio|chorar|sem [âa]nimo)/,
    respostas: [
      "Sinto muito que o dia esteja difícil. Não há problema em não estar bem — quer me contar mais?",
      "Estou aqui com você. O que você acha que mais contribuiu para se sentir assim?",
    ],
  },
  {
    padrao: /(sozinh|solid[ãa]o|ningu[ée]m|isolad)/,
    respostas: [
      "Sentir-se sozinho é difícil. Obrigado por dividir isso comigo — quer falar sobre o que tem pesado?",
      "Eu te escuto. O que tem feito a solidão parecer mais forte ultimamente?",
    ],
  },
  {
    padrao: /(raiva|irritad|bravo|furi|[óo]di|revolt)/,
    respostas: [
      "A raiva também é válida. O que aconteceu que te deixou assim?",
      "Faz sentido sentir isso. Quer me contar o que disparou essa raiva?",
    ],
  },
  {
    padrao: /(cansad|exaust|estress|sobrecarg|esgotad|sem tempo)/,
    respostas: [
      "Parece que você está carregando bastante coisa. O que tem pesado mais na sua rotina?",
      "Cansaço acumulado é duro. Tem algo que você gostaria de poder soltar um pouco?",
    ],
  },
  {
    padrao: /(feliz|grato|gratid[ãa]o|alegr|animad|consegui|orgulh)/,
    respostas: [
      "Que bom ler isso. O que tornou esse momento especial para você?",
      "Fico feliz que você esteja se sentindo assim. Quer registrar o que ajudou?",
    ],
  },
];

// Frases neutras de escuta ativa (rotação quando nenhuma palavra-chave casa).
const NEUTRAS = [
  "Entendo. Quer me contar um pouco mais sobre isso?",
  "Obrigado por compartilhar. Como você se sente em relação a isso?",
  "Estou te ouvindo. O que mais passou pela sua cabeça?",
  "Faz sentido. O que isso significa para você?",
];

function escolher(opcoes: string[]): string {
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

/** Gera a resposta da "psicóloga IA" para uma mensagem do usuário (mock, local). */
export function gerarRespostaIa(mensagem: string): string {
  const texto = mensagem.toLowerCase();

  if (PADRAO_CRISE.test(texto)) {
    return RESPOSTA_CRISE;
  }

  for (const regra of REGRAS) {
    if (regra.padrao.test(texto)) {
      return escolher(regra.respostas);
    }
  }

  return escolher(NEUTRAS);
}
