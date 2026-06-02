# PLAN.md — Roadmap do MindLog

Roadmap de implementação dividido em fases. Cada sub-tarefa foi dimensionada para
caber em uma sessão de trabalho de 30 a 60 minutos. As fases são sequenciais: o foco
do projeto é banco de dados, então a modelagem e a autenticação vêm antes das telas.

Fonte de verdade do escopo: `briefing.md`. Decisões fora do escopo: `docs/decisoes.md`.

Convenção: `- [ ]` tarefa pendente, `- [x]` concluída. Itens **Validar** são checagens
manuais no navegador feitas ao fim de cada feature.

---

## Fase 0 — Setup do projeto

- [x] Inicializar projeto Next.js (App Router) + TypeScript com `create-next-app`
- [x] Configurar Tailwind CSS e verificar que classes funcionam numa página de teste
- [ ] Definir paleta e fontes do deck no `tailwind.config` / globals (roxo `#6C5CE7`,
      lavanda `#F5F3FF`, fonte serifada para títulos, sans-serif para corpo) — ADIADO
- [x] Instalar e inicializar Prisma com provider SQLite (`prisma init`)
- [x] Criar estrutura de pastas (`app/`, `lib/`, `data/`, `prisma/`, `docs/`)
      — falta `components/` (será criada na Fase 3, com o primeiro componente)
- [x] Configurar `.env` com `DATABASE_URL` e `ENCRYPTION_KEY`; garantir `.env` no
      `.gitignore` e criar `.env.example`
      — `ENCRYPTION_KEY` documentada no `.env.example`; valor real será gerado na Fase 3
- [ ] Configurar ESLint/Prettier e um script de format — ESLint ok (via create-next-app);
      Prettier e script de format ADIADOS
- [x] **Validar:** rodar `npm run dev`, abrir a página inicial, confirmar Tailwind
      (fontes do deck pendem do item de paleta acima)
- [x] Commit do setup

## Fase 1 — Modelagem do banco

- [x] Criar `docs/schema.md` descrevendo entidades, atributos e relações em linguagem
      natural antes de codar (User, MoodCheckIn, JournalEntry, AiConversation,
      AiMessage, Post, Plan, AuditLog)
- [x] Documentar em `docs/schema.md` os campos sensíveis (texto do diário, mensagens
      de IA) que serão criptografados em repouso, e a estratégia de soft delete
      (`deletadoEm`)
- [x] Escrever `schema.prisma` com os modelos da Onda 1 (User, MoodCheckIn,
      JournalEntry) e suas relações
- [x] Adicionar modelos da Onda 2/3 ao `schema.prisma` (AiConversation, AiMessage,
      Post, Plan, AuditLog)
- [x] Rodar a primeira migration (`prisma migrate dev`) e gerar o client
- [x] Criar `lib/db.ts` com o singleton do Prisma Client
- [x] (Opcional) Criar script de seed (feito: seed idempotente dos 3 planos em
      `prisma/seed.ts`, em vez de usuário de exemplo)
- [x] **Validar:** abrir `prisma studio`, confirmar tabelas criadas e relações corretas
- [x] Commit da modelagem

## Fase 2 — Autenticação

- [x] Criar helpers de senha em `lib/auth.ts` (hash e verificação com bcrypt/argon2)
- [x] Criar helpers de sessão (criar, ler e destruir cookie HTTP-only)
- [x] Tela de cadastro: formulário de 4 campos (nome, e-mail, senha, confirmação) +
      checkbox de termos com link para política de privacidade
- [x] Validação de cadastro no cliente e no servidor; criar usuário com senha em hash
- [ ] Rota/action de login: e-mail + senha, verificar hash, criar sessão por cookie
- [ ] Logout: destruir sessão e redirecionar para login
- [ ] Middleware/guarda de rotas: páginas autenticadas redirecionam para login sem
      sessão válida
- [x] Registrar consentimento do cadastro (timestamp) — primeiro requisito de LGPD
- [ ] **Validar:** cadastrar usuário novo, fazer login, acessar rota protegida,
      fazer logout, confirmar redirecionamento ao tentar acessar rota protegida
      deslogado
- [ ] **Validar:** tentar cadastrar e-mail duplicado e senha que não confere — conferir
      mensagens de erro
- [ ] Commit da autenticação

## Fase 3 — Onda 1: Núcleo

### Dashboard de início
- [ ] Layout autenticado (menu lateral/inferior, container lavanda, cards brancos)
- [ ] Dashboard: saudação com nome + data e 4 cards de ação rápida (check-in, diário,
      IA, insights)
- [ ] Frase motivacional aleatória no dashboard
- [ ] **Validar:** logar e conferir saudação com o nome correto e navegação dos cards

### Check-in de humor
- [ ] UI do check-in: 4 opções (Mal, Neutro, Bem, Muito bem) + nota opcional, botões
      grandes (Lei de Fitts)
- [ ] Action para salvar check-in no banco com timestamp e vínculo ao usuário
- [ ] Registrar entrada no `AuditLog` ao criar check-in
- [ ] **Validar:** fazer um check-in, conferir persistência no Prisma Studio e linha
      no AuditLog

### Diário
- [ ] Editor de texto livre para nova entrada de diário (texto puro)
- [ ] Salvar entrada criptografada em repouso, com data e vínculo ao usuário
- [ ] Histórico lateral listando entradas por data
- [ ] Editar entrada própria
- [ ] Apagar entrada própria (com confirmação) e registrar no AuditLog
- [ ] **Validar:** criar, editar e apagar uma entrada; confirmar que o texto está
      criptografado no banco e legível na UI
- [ ] Commit da Onda 1

## Fase 4 — Onda 2: Valor

### Insights
- [ ] Queries de agregação (dias seguidos de check-in, nº de entradas, sessões de IA,
      humor médio dos últimos 7 dias)
- [ ] Página de insights exibindo os números agregados
- [ ] Gráfico simples do humor (SVG próprio ou Recharts)
- [ ] **Validar:** popular alguns dias de dados e conferir que os agregados batem

### Chat IA mockada
- [ ] Função local de resposta da IA (palavras-chave + rotação de respostas neutras de
      escuta ativa) em `lib/ai-mock.ts`
- [ ] UI de chat (mensagens do usuário à direita, IA à esquerda)
- [ ] Persistir conversa e mensagens no banco vinculadas ao usuário (mensagens
      criptografadas em repouso)
- [ ] Aviso visível de que a IA não substitui terapeuta humano
- [ ] **Validar:** trocar mensagens, recarregar a página e confirmar histórico
      persistido; testar uma palavra-chave conhecida

### Perfil + LGPD
- [ ] Tela de perfil: visualizar dados, editar nome, ver plano
- [ ] **Exportar meus dados:** gerar JSON com todos os registros do usuário e baixar
      (direito de portabilidade)
- [ ] **Apagar minha conta:** confirmação em duas etapas, soft delete (`deletadoEm`) +
      anonimização, registro no AuditLog (direito ao esquecimento)
- [ ] Após exclusão, garantir que a sessão é encerrada e o login é bloqueado
- [ ] **Validar:** exportar dados e inspecionar o JSON; apagar a conta e confirmar que
      o login deixa de funcionar e os dados foram anonimizados
- [ ] Commit da Onda 2

## Fase 5 — Onda 3: Diferenciais (se sobrar tempo)

### Comunidade
- [ ] Modelo/feed de posts curtos com data e vínculo ao usuário
- [ ] Criar post e listar feed
- [ ] Botão de "coração" (curtir/descurtir)
- [ ] **Validar:** criar post, curtir, recarregar e conferir persistência

### Exercícios
- [ ] Conteúdo estático em JSON (Respiração 4-7-8, Meditação, Gratidão, Body scan,
      Visualização, Carta para si)
- [ ] Lista de exercícios com título, duração e descrição (sem banco)
- [ ] **Validar:** abrir a lista e conferir os 6 exercícios

### Suporte
- [ ] Página de suporte com canais (chat fictício, e-mail, **CVV 188**) e FAQ estático
- [ ] Garantir que o CVV 188 esteja acessível em no máximo dois cliques de qualquer tela
- [ ] **Validar:** navegar de telas diferentes até o CVV em ≤ 2 cliques

### Planos (opcional)
- [ ] Tabela de planos (Semente, Equilíbrio, Florescer) no banco
- [ ] Lógica de limites por plano (ex.: contar mensagens de IA por dia no Semente)
- [ ] **Validar:** simular limite no plano Semente e conferir o bloqueio

## Fase 6 — Polimento e documentação final

- [ ] Escrever `docs/lgpd.md` (consentimento, acesso, portabilidade, esquecimento,
      minimização, auditoria, criptografia em repouso, honestidade sobre E2E aspiracional)
- [ ] Atualizar `docs/decisoes.md` com decisões fora do escopo e seus motivos
- [ ] Revisar responsividade mobile (persona usa em surtos curtos no celular)
- [ ] Revisar acessibilidade básica (contraste, tamanho de toque 44x44, foco de teclado)
- [ ] Escrever `README.md` (o que é, stack, como rodar localmente, variáveis de ambiente)
- [ ] Capturar screenshots das telas principais para o README
- [ ] **Validar:** seguir o README do zero em ambiente limpo e confirmar que o app sobe
- [ ] Commit final da documentação
