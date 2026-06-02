// FAQ do suporte — conteúdo ESTÁTICO (ADR 0010), sem banco.

export type ItemFaq = {
  pergunta: string;
  resposta: string;
};

export const FAQ: ItemFaq[] = [
  {
    pergunta: "O MindLog substitui terapia ou um profissional de saúde?",
    resposta:
      "Não. O MindLog é um espaço de autoconhecimento e apoio no dia a dia. Ele não substitui acompanhamento de um psicólogo ou psiquiatra. Em caso de crise, ligue para o CVV no 188.",
  },
  {
    pergunta: "A IA é uma psicóloga de verdade?",
    resposta:
      "Não. A 'psicóloga IA' é um recurso automatizado para ajudar você a refletir e desabafar. Ela não é um profissional e não dá diagnósticos.",
  },
  {
    pergunta: "Meus dados estão seguros?",
    resposta:
      "Seus registros de humor, entradas de diário e conversas com a IA são guardados criptografados. Você pode exportar ou apagar seus dados a qualquer momento na tela de Perfil.",
  },
  {
    pergunta: "Como exporto ou apago meus dados?",
    resposta:
      "Vá em Perfil. Lá você pode baixar todos os seus dados em um arquivo (portabilidade) e também apagar sua conta (direito ao esquecimento).",
  },
  {
    pergunta: "Esqueci minha senha. O que faço?",
    resposta:
      "Neste projeto acadêmico, a recuperação de senha por e-mail ainda não está disponível. Guarde sua senha com cuidado.",
  },
];
