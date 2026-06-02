// Exercícios guiados — conteúdo ESTÁTICO (ADR 0010): não vai para o banco, é só
// dado de referência exibido na UI. Em .ts (em vez de .json) para ter tipagem.

export type Exercicio = {
  id: string;
  titulo: string;
  duracao: string;
  descricao: string;
};

export const EXERCICIOS: Exercicio[] = [
  {
    id: "respiracao-4-7-8",
    titulo: "Respiração 4-7-8",
    duracao: "3 min",
    descricao:
      "Inspire pelo nariz contando até 4, segure o ar contando até 7 e expire pela boca contando até 8. Repita o ciclo 4 vezes para acalmar o corpo.",
  },
  {
    id: "meditacao-guiada",
    titulo: "Meditação guiada",
    duracao: "10 min",
    descricao:
      "Sente-se confortavelmente, feche os olhos e leve a atenção à respiração. Quando a mente dispersar, traga o foco de volta com gentileza, sem se cobrar.",
  },
  {
    id: "gratidao-diaria",
    titulo: "Gratidão diária",
    duracao: "5 min",
    descricao:
      "Liste três coisas pelas quais você é grato hoje — por menores que sejam. Note como você se sente ao reconhecer cada uma delas.",
  },
  {
    id: "body-scan",
    titulo: "Body scan",
    duracao: "8 min",
    descricao:
      "Percorra mentalmente o corpo, dos pés à cabeça, observando as sensações em cada parte sem tentar mudá-las. Apenas perceba o que está presente.",
  },
  {
    id: "visualizacao",
    titulo: "Visualização",
    duracao: "6 min",
    descricao:
      "Imagine um lugar onde você se sente seguro e em paz. Explore os detalhes — cores, sons, temperatura — e permita-se descansar nessa cena por alguns minutos.",
  },
  {
    id: "carta-para-si",
    titulo: "Carta para si",
    duracao: "10 min",
    descricao:
      "Escreva uma carta curta para você mesmo, com a mesma compaixão que teria por um amigo querido em um dia difícil. Releia quando precisar de acolhimento.",
  },
];
