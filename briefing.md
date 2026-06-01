# MindLog — Briefing do projeto

Este documento descreve o projeto MindLog para qualquer agente de IA, colaborador ou avaliador que abrir o repositório. É a fonte de verdade sobre o que estamos construindo, por quê, e em que escopo.

## Visão geral

MindLog é um **diário emocional digital** que combina três funções centrais para apoiar autoconhecimento e bem-estar mental do usuário no dia a dia: registro de humor diário (check-in rápido), escrita de diário pessoal com histórico visual, e conversa com uma "psicóloga IA" disponível 24 horas. O produto se posiciona como espaço de **autoconhecimento**, não de tratamento clínico — a IA não substitui terapeuta humano e isso deve estar comunicado claramente ao usuário em pontos relevantes da interface.

O tagline da apresentação é "Curando mentes com IA". O posicionamento é privacidade radical (criptografia ponta a ponta, conformidade LGPD), acolhimento sem julgamento, e construção de hábito em sessões curtas (5 a 10 minutos no celular).

## Escopo acadêmico — leia antes de tudo

Este é um **projeto de faculdade** (UNIFRAN, disciplina de UX/UI, Prof. Renato Rocha), não um produto comercial. Algumas implementações são intencionalmente simplificadas:

- **A IA é mockada.** Nenhuma chamada para API externa de LLM. As respostas da "psicóloga IA" vêm de um conjunto pré-escrito de respostas, ou de um sistema simples de regras que reage a palavras-chave. O foco do projeto não é a IA — é o banco de dados e a experiência de usuário.
- **Login é real, mas simples.** Cadastro e autenticação funcionam (hash de senha, sessão), porque integram com o banco. Mas sem recuperação de senha por e-mail, sem autenticação multifator, sem OAuth (Google/Apple) — esses ficam como "futuras melhorias".
- **A criptografia ponta a ponta prometida no deck é aspiracional.** Vamos implementar criptografia em repouso (no banco) para campos sensíveis, mas não a ponta a ponta verdadeira (que exigiria criptografia no cliente com chave derivada da senha do usuário). Isso será documentado honestamente em `docs/lgpd.md`.
- **Sem pagamento real.** Os planos (Semente / Equilíbrio / Florescer) existem como estrutura de dados e podem aparecer na UI, mas não há integração com gateway de pagamento. O plano do usuário é editável em desenvolvimento.
- **Sem moderação real da comunidade.** Posts e comentários existem como modelo de dados e tela, mas sem fluxo de denúncia, sem moderação automática.

O foco do projeto é **aprender modelagem e operação de banco de dados em um contexto realista**, incluindo considerações de LGPD para dados sensíveis de saúde mental.

## Persona principal — Renato

Toda decisão de produto deve passar pela seguinte pergunta: "isso funciona para o Renato?"

- **38 anos, professor universitário, mora em Batatais (SP).**
- **Rotina apertada:** trabalha 50 horas por semana, pai de duas crianças. Tem cinco a dez minutos por vez para usar o app, no celular, em momentos curtos do dia.
- **Objetivos:** entender padrões do próprio humor sem precisar de terapeuta, ter espaço para desabafar tarde da noite, reduzir ansiedade antes de aulas importantes.
- **Dores:** apps de bem-estar pedem cadastros longos demais, receio de ter dados privados expostos, desiste de apps em até três dias se não enxerga valor rápido.
- **Comportamento digital:** prefere interfaces minimalistas e diretas, usa o celular em surtos rápidos, abandona apps que exigem fricção logo nas primeiras telas.

Consequências de design que decorrem da persona: cadastro precisa caber em uma tela com poucos campos, ações principais precisam estar a um toque do início, check-in tem que ser concluível em menos de trinta segundos, e a interface não pode ter ruído visual que sobrecarregue alguém cansado.

## Features e telas (escopo de implementação)

A apresentação cobre 20 slides com várias telas. Para o escopo do projeto acadêmico, organize a implementação em ondas, do essencial para o opcional. O `PLAN.md` deve refletir essa priorização.

### Onda 1 — Núcleo (obrigatório)

- **Cadastro.** Formulário de quatro campos (nome, e-mail, senha, confirmação) mais checkbox de termos. Validação no cliente e no servidor. Senha armazenada como hash (bcrypt ou argon2).
- **Login.** E-mail + senha. Sessão por cookie (não JWT em localStorage — cookie HTTP-only é mais seguro).
- **Dashboard de início.** Saudação com nome do usuário e data, quatro cards de ação rápida (check-in, diário, IA, insights), e uma frase motivacional aleatória.
- **Check-in de humor.** Quatro opções: Mal, Neutro, Bem, Muito bem. Campo de texto opcional para nota curta. Salva no banco com timestamp.
- **Diário.** Editor de texto livre (texto puro inicialmente; markdown se sobrar tempo). Histórico lateral listando entradas anteriores por data. Editar e apagar entradas próprias.
- **Logout e proteção de rotas.** Páginas autenticadas redirecionam para login se não houver sessão válida.

### Onda 2 — Funcionalidades de valor

- **Insights.** Página com agregações: dias seguidos de check-in, número de entradas no diário, sessões com IA, humor médio dos últimos sete dias, gráfico simples (pode ser SVG ou biblioteca leve tipo Recharts).
- **Conversa com IA mockada.** Interface de chat (mensagens do usuário à direita, da IA à esquerda). Respostas vêm de função local que reconhece palavras-chave ou rotaciona entre um conjunto de respostas neutras de escuta ativa. Conversas são persistidas no banco vinculadas ao usuário.
- **Perfil.** Visualizar dados pessoais, editar nome, ver plano. Botões para exportar diário e apagar conta (requisitos de LGPD — explicado adiante).

### Onda 3 — Diferenciais (se sobrar tempo)

- **Comunidade.** Feed de posts curtos com botão de "coração". Posts vinculados a usuário, com data. Comentários ficam fora do escopo inicial.
- **Exercícios.** Lista de práticas guiadas com título, duração e descrição (Respiração 4-7-8, Meditação guiada, Gratidão diária, Body scan, Visualização, Carta para si). São conteúdo estático — não precisam de banco, podem ser um JSON.
- **Suporte.** Página com canais (chat fictício, e-mail, link para CVV) e FAQ estático. Conteúdo simples, sem banco.
- **Sistema de planos.** Estrutura de planos (Semente, Equilíbrio, Florescer) refletida no banco como tabela. Sem pagamento, mas com lógica que respeita limites (ex: contar mensagens por dia se o usuário estiver no Semente).

### Tela em destaque para LGPD

A tela de perfil deve ter botões funcionais para:

- **Exportar meus dados.** Gera um JSON ou PDF com todos os registros do usuário e baixa no navegador. Este é o **direito de portabilidade** da LGPD.
- **Apagar minha conta.** Confirmação de duas etapas. Implementa **direito ao esquecimento**. Usar soft delete inicialmente (marcar a conta como `deletadoEm` e anonimizar dados), explicar a decisão em `docs/lgpd.md`.

## Princípios de UX aplicados (do deck)

Estes princípios devem ser respeitados em qualquer tela nova:

- **Lei de Hick** — o tempo de decisão cresce com o número de opções. Por isso o check-in oferece quatro humores, não dez. Resista à tentação de adicionar opções "no caso".
- **Lei de Fitts** — botões maiores e mais próximos são mais fáceis de acionar. Botões primários ("Criar conta", "Entrar", "Salvar check-in") ocupam toda a largura útil do contêiner. Toques em mobile são imprecisos; tamanho mínimo recomendado é 44 por 44 pixels.
- **Gestalt — proximidade.** Elementos próximos formam grupos visuais. Use isso para agrupar conteúdo relacionado (preço + ícone + benefícios num mesmo card de plano, entrada de diário + sua data + seu humor associado).
- **Gestalt — similaridade.** Elementos parecidos comunicam mesma função. Ícones do menu lateral devem seguir mesmo estilo e peso; botões com função similar devem ter aparência similar.

## Identidade visual

A paleta e tipografia já estão definidas no deck. Replicar:

- **Cor primária:** roxo/violeta saturado (aproximadamente `#5B4DD4` ou `#6C5CE7`). É a cor das ações principais, ícones e elementos de identidade.
- **Background dashboard:** lavanda muito claro (aproximadamente `#F5F3FF`). Cria sensação de calma, contrasta com o branco dos cards.
- **Cards:** brancos com sombra suave e cantos arredondados.
- **Ícones:** em círculos roxos claros, ícones em tom escuro para contraste.
- **Acento de check-in:** verde suave (Mal → Muito bem segue gradiente de cores se possível, mas não obrigatório).
- **Fonte de títulos:** serifada com personalidade (no deck parece Georgia ou Palatino). Inspira confiança e calma.
- **Fonte de corpo:** sans-serif limpa (Inter, system-ui ou similar).

A apresentação completa, com as telas exatas, está em `docs/referencias/mindlog-apresentacao.pdf`. Consulte-a sempre que precisar reproduzir uma tela específica.

## Stack técnica decidida

Escolhida para equilibrar aprendizado, simplicidade e profissionalismo:

- **Next.js (App Router) com TypeScript.** React + rotas de API no mesmo projeto, sem necessidade de backend separado.
- **Tailwind CSS** para estilização. Combina bem com o estilo do deck e elimina a fricção de CSS separado.
- **Prisma + SQLite** para banco. Zero configuração de servidor de banco, schema declarativo, type-safety com TypeScript. Se sobrar tempo, migrar para PostgreSQL para deploy.
- **bcrypt** ou **argon2** para hash de senha.
- **Cookie de sessão HTTP-only** para autenticação (mais seguro que JWT em localStorage para esse caso).

Decisões que estão deliberadamente fora do escopo: OAuth, recuperação de senha por e-mail, autenticação multifator, criptografia ponta a ponta verdadeira, integração de pagamento, push notifications, app mobile nativo. Cada uma dessas decisões deve ser registrada em `docs/decisoes.md` com a justificativa.

## Considerações de LGPD

Diário emocional é dado **sensível** sob a Lei Geral de Proteção de Dados (artigo 5º, inciso II — dados referentes à saúde do titular). Isso exige tratamento diferenciado mesmo em projeto acadêmico, e demonstrar consciência disso é parte do diferencial deste projeto.

Compromissos do MindLog (a serem implementados e documentados em `docs/lgpd.md`):

- **Consentimento explícito** no cadastro, com link para política de privacidade.
- **Direito de acesso:** usuário pode visualizar todos os seus dados a qualquer momento (tela de perfil).
- **Direito de portabilidade:** usuário pode exportar todos os seus dados em formato legível (JSON ou PDF).
- **Direito ao esquecimento:** usuário pode apagar sua conta. Soft delete com anonimização imediata e remoção física após período de carência.
- **Minimização:** coletar apenas o estritamente necessário. Não pedir CPF, telefone, endereço.
- **Auditoria:** toda alteração em dados sensíveis (diário, registro de humor, conta) gera linha em tabela `AuditLog` com timestamp, ação, e usuário responsável.
- **Criptografia em repouso:** campos sensíveis (texto do diário, mensagens com IA) armazenados criptografados no banco. Chave de criptografia gerenciada por variável de ambiente, nunca commitada.

## Tom de comunicação

Em toda comunicação com o usuário pela interface, mantenha:

- **Acolhedor, não corporativo.** Use segunda pessoa ("você", "seu"), evite jargão.
- **Sem moralismo ou positividade tóxica.** Não force o usuário a "ver o lado bom". Reconheça que dias ruins existem e são válidos.
- **Honesto sobre limitações.** Em qualquer ponto onde a IA é apresentada, deixe claro que não substitui terapeuta humano. A tela de suporte tem o canal do CVV (188) — esse número deve estar acessível com no máximo dois cliques de qualquer tela.

## Glossário rápido

Termos que aparecem ao longo do projeto, definidos para evitar ambiguidade:

- **Check-in:** registro rápido de humor do dia, com escala de quatro opções (Mal, Neutro, Bem, Muito bem) e nota opcional.
- **Entrada de diário:** texto livre que o usuário escreve sobre o dia. Pode estar ligada a um check-in do mesmo dia ou ser independente.
- **Insight:** visualização agregada de dados do usuário ao longo do tempo (humor médio semanal, dias seguidos, etc).
- **Persona de IA:** estilo de conversa da psicóloga IA (acolhedora, motivacional, racional, criativa). No escopo acadêmico, implementada como variações de tom em respostas pré-escritas.
- **Audit log:** tabela de auditoria que registra alterações em dados sensíveis para fins de LGPD.
- **Soft delete:** apagamento lógico — registro é marcado como deletado (`deletadoEm`) sem ser fisicamente removido imediatamente. Permite reversão em janela curta e auditoria.

## Como manter este briefing

Este arquivo é a fonte de verdade do projeto. Mudanças significativas no escopo devem ser refletidas aqui. Quando uma decisão de produto ou design mudar, atualizar este briefing e registrar a mudança em `docs/decisoes.md` com data e motivo.
