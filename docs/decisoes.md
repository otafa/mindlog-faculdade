# docs/decisoes.md — Registro de decisões (ADR)

Registro das decisões de arquitetura do MindLog no formato **ADR** (Architecture
Decision Records). Cada entrada documenta o contexto, as opções consideradas, a decisão
e suas consequências. Fonte de verdade do escopo: `briefing.md`.

---

## ADR 0001 — Next.js com App Router

- **Data:** 2026-06-01
- **Contexto:** precisamos de frontend e endpoints de API para um projeto acadêmico de
  um só desenvolvedor, sem operar dois serviços separados.
- **Opções consideradas:** (a) Next.js App Router; (b) React puro (Vite) + backend
  separado (Express/Nest); (c) HTML estático sem framework.
- **Decisão:** Next.js (App Router) com TypeScript — React e rotas de API no mesmo
  projeto.
- **Consequências:** um único deploy e codebase; server components facilitam acesso
  direto ao banco. Em troca, há acoplamento ao ecossistema Next e curva do App Router.

## ADR 0002 — SQLite + Prisma

- **Data:** 2026-06-01
- **Contexto:** o foco do projeto é aprender modelagem de banco; precisamos de schema
  declarativo e type-safety, com mínima fricção de infraestrutura.
- **Opções consideradas:** (a) SQLite + Prisma; (b) PostgreSQL direto; (c) MongoDB.
- **Decisão:** Prisma ORM com SQLite como banco de desenvolvimento.
- **Consequências:** zero configuração de servidor de banco e migrations versionadas.
  SQLite tem tipagem limitada (enums emulados, sem `Decimal` rico). Caminho de migração
  para PostgreSQL fica aberto via Prisma se houver deploy.

## ADR 0003 — Login real com sessão por cookie

- **Data:** 2026-06-01
- **Contexto:** autenticação precisa exercitar o banco (usuários, sessões) de forma
  realista, mantendo segurança adequada para dados sensíveis.
- **Opções consideradas:** (a) login real com sessão em cookie HTTP-only; (b) login
  totalmente mockado; (c) JWT armazenado em localStorage.
- **Decisão:** cadastro/login reais com senha em hash (bcrypt/argon2) e sessão por
  cookie HTTP-only persistida no banco.
- **Consequências:** integra com o banco (objetivo de aprendizado) e cookie HTTP-only
  evita XSS roubando token. Fora do escopo: OAuth, recuperação por e-mail, MFA.

## ADR 0004 — IA mockada

- **Data:** 2026-06-01
- **Contexto:** o produto promete uma "psicóloga IA", mas o foco acadêmico é banco de
  dados e UX, não modelagem de linguagem; chamadas externas trazem custo e chaves.
- **Opções consideradas:** (a) IA mockada local; (b) API externa de LLM (OpenAI/Anthropic).
- **Decisão:** respostas geradas por função local (palavras-chave + rotação de respostas
  de escuta ativa), persistidas no banco como qualquer conversa.
- **Consequências:** sem custo, sem chave de API, sem dependência de rede; o foco fica no
  banco. Em troca, as respostas são limitadas e não "inteligentes" — comunicado ao usuário.

## ADR 0005 — Soft delete em entidades sensíveis

- **Data:** 2026-06-01
- **Contexto:** a LGPD exige direito ao esquecimento, mas também auditabilidade e uma
  janela de reversão contra exclusões acidentais de dados de saúde.
- **Opções consideradas:** (a) soft delete (`deletadoEm` + anonimização); (b) hard delete
  imediato.
- **Decisão:** soft delete nas entidades sensíveis/reversíveis (Usuario, RegistroHumor,
  EntradaDiario, SessaoChat, MensagemChat, Post); remoção física após carência de 30 dias.
- **Consequências:** permite reverter e auditar; atende portabilidade/esquecimento da LGPD.
  Em troca, toda query precisa filtrar `deletadoEm IS NULL` e exige limpeza posterior.

## ADR 0006 — IDs como CUID

- **Data:** 2026-06-01
- **Contexto:** precisamos de chave primária para todas as entidades de domínio; a forma
  do ID pode vazar informação de negócio.
- **Opções consideradas:** (a) CUID gerado pela aplicação; (b) `Int` autoincrement;
  (c) UUID v4.
- **Decisão:** CUID como `id` (String) nas entidades de domínio.
- **Consequências:** IDs não sequenciais não vazam volume de usuários nem ordem de
  criação — relevante para um app de saúde mental (autoincrement exporia "quantos
  usuários existem"). Em troca, IDs são maiores e menos legíveis que um `Int` num estudo
  de banco. `Plano.id` é exceção: usa slug textual estável.

## ADR 0007 — Sessão de autenticação como tabela no banco

- **Data:** 2026-06-01
- **Contexto:** a autenticação por cookie (ADR 0003) precisa decidir onde mora o estado
  da sessão.
- **Opções consideradas:** (a) tabela `Sessao` no banco referenciada pelo cookie;
  (b) cookie assinado stateless (JWT/sessão assinada sem persistência).
- **Decisão:** persistir sessões na tabela `Sessao`; o cookie HTTP-only carrega só o id.
- **Consequências:** permite **revogar** sessões, listá-las e limpar expiradas — útil para
  dados sensíveis. Custo: uma consulta extra ao banco por requisição autenticada, e
  necessidade de cleanup das sessões vencidas.

## ADR 0008 — Criptografia em repouso só em texto livre sensível

- **Data:** 2026-06-01
- **Contexto:** dados sensíveis de saúde exigem proteção, mas os insights dependem de
  agregar o humor via SQL — e campo criptografado não é agregável nem indexável.
- **Opções consideradas:** (a) criptografar todos os campos sensíveis, inclusive o humor;
  (b) criptografar apenas os campos de texto livre sensível.
- **Decisão:** criptografar em repouso `RegistroHumor.nota`, `EntradaDiario.conteudo` e
  `MensagemChat.conteudo`; manter `RegistroHumor.humor` (Int 1–4) em claro.
- **Consequências:** trade-off explícito **agregação vs. sigilo** — o humor numérico em
  claro viabiliza `AVG`/`COUNT` para os insights, enquanto a nota textual associada
  permanece cifrada. Documentado em `docs/lgpd.md`. Chave em `ENCRYPTION_KEY`.

## ADR 0009 — Curtidas como tabela N:N

- **Data:** 2026-06-01
- **Contexto:** posts da comunidade têm curtidas; é preciso saber se um usuário já curtiu
  e impedir curtida dupla.
- **Opções consideradas:** (a) tabela de junção `Curtida` (N:N) com PK composta;
  (b) contador `Int` em `Post`.
- **Decisão:** tabela `Curtida` com `@@id([usuarioId, postId])`.
- **Consequências:** impede curtida duplicada **por construção**, permite descurtir
  (remover a linha) e exibir o estado "curtido por este usuário". A contagem vira um
  `COUNT` derivado em vez de campo materializado — leve custo de consulta, ganho de
  integridade. Um contador `Int` seria mais simples mas não saberia *quem* curtiu.

## ADR 0010 — Planos como tabela com seed do Prisma

- **Data:** 2026-06-01
- **Contexto:** os três planos (Semente, Equilíbrio, Florescer) têm limites associados
  (ex.: mensagens de IA por dia) que a lógica precisa consultar.
- **Opções consideradas:** (a) tabela `Plano` populada por seed; (b) enum + constantes
  hardcoded em código.
- **Decisão:** modelar `Plano` como tabela, com carga inicial via seed do Prisma
  (`semente: 40`, demais ilimitados).
- **Consequências:** limites viram **dados consultáveis** e ajustáveis sem alterar código;
  atende o briefing ("planos refletidos no banco como tabela"). Custo: uma FK a mais e
  dependência do seed para o banco ficar utilizável.

## ADR 0011 — Timezone em UTC, convertido na borda

- **Data:** 2026-06-01
- **Contexto:** os insights agrupam dados por dia (humor médio dos últimos 7 dias, dias
  seguidos de check-in), e o público é brasileiro (`America/Sao_Paulo`).
- **Opções consideradas:** (a) armazenar em UTC e converter na exibição/agregação;
  (b) armazenar já no horário local do servidor.
- **Decisão:** persistir todo `DateTime` em UTC (default do Prisma) e converter para
  `America/Sao_Paulo` apenas ao exibir e ao agrupar por dia.
- **Consequências:** evita que check-ins próximos à meia-noite caiam no dia errado nos
  insights. Custo: as queries de agregação por dia precisam aplicar o offset antes do
  `GROUP BY`, em vez de comparar a data crua em UTC.

## ADR 0012 — Driver adapter @prisma/adapter-better-sqlite3

- **Data:** 2026-06-01
- **Contexto:** o Prisma 7, com o gerador `prisma-client`, exige um driver adapter
  explícito para instanciar o client (mudança em relação ao Prisma 6, que conectava
  direto pela `datasource`).
- **Opções consideradas:** (a) `@prisma/adapter-better-sqlite3`; (b) `@prisma/adapter-libsql`.
- **Decisão:** usar `@prisma/adapter-better-sqlite3` para o SQLite local.
- **Consequências:** uma dependência adicional, instanciada no singleton `src/lib/db.ts`
  com a `DATABASE_URL`. Em uma migração futura para PostgreSQL, trocar pelo
  `@prisma/adapter-pg`.

## ADR 0013 — Hash de senha com Argon2id

- **Data:** 2026-06-02
- **Contexto:** a Fase 2 (autenticação) exige armazenar senhas com hash; o briefing
  deixou "bcrypt ou argon2" em aberto. A senha protege o acesso a dados sensíveis de
  saúde, então a escolha precisa ser defensável.
- **Opções consideradas:** (a) Argon2id via `@node-rs/argon2` (binário pré-compilado,
  sem node-gyp); (b) bcrypt; (c) Argon2id via pacote nativo `argon2` (node-argon2,
  compila C++ via node-gyp).
- **Decisão:** Argon2id, usando a biblioteca `@node-rs/argon2`. Parâmetros mínimos do
  OWASP: 19 MiB de memória (19456 KiB), 2 iterações, 1 grau de paralelismo.
- **Consequências:** pacote nativo a mais, mas alinhado ao OWASP atual e sem o limite de
  72 bytes do bcrypt. O `@node-rs/argon2` (Rust/N-API) evita o build via node-gyp, que é
  um risco no Node 26 por causa de incompatibilidade de ABI. Os parâmetros ficam embutidos
  na própria string do hash, então a verificação os lê automaticamente — não precisamos
  guardá-los à parte.

## ADR 0014 — Token de sessão aleatório separado do id

- **Data:** 2026-06-02
- **Contexto:** a ADR 0007 definiu sessão com estado no banco, referenciada por cookie.
  Falta decidir QUAL valor o cookie carrega. Esse valor é, na prática, a credencial de
  acesso à sessão e precisa ser imprevisível.
- **Opções consideradas:** (a) cookie carrega o próprio Sessao.id (CUID); (b) cookie
  carrega um token aleatório criptográfico separado, guardado em Sessao.token.
- **Decisão:** adicionar Sessao.token (String @unique), gerado com crypto.randomBytes
  (32 bytes, base64url), usado como valor do cookie. Sessao.id (CUID) permanece como
  chave primária interna.
- **Consequências:** CUID não foi projetado para ser segredo, logo não serve como
  credencial; o token aleatório atende à recomendação de ≥64 bits de entropia de
  gerador seguro. O token é armazenado em claro no banco por ora (escopo acadêmico);
  guardar o hash do token em repouso fica como melhoria futura, a registrar em
  docs/lgpd.md. Refina a ADR 0007.

## ADR 0015 — Guarda de rotas em duas camadas (proxy + validação no servidor)

- **Data:** 2026-06-02
- **Contexto:** no Next.js 16 o proxy roda na borda (edge) e validar a sessão de
  verdade exige consulta ao banco (tabela Sessao). Precisamos decidir onde mora cada
  checagem de acesso.
- **Opções consideradas:** (a) proxy só checa presença do cookie + validação real nos
  Server Components; (b) validar token/expiração dentro do próprio proxy (exigiria
  tocar o banco na borda); (c) confiar apenas no proxy como barreira.
- **Decisão:** duas camadas. O proxy ("porteiro") apenas verifica a PRESENÇA do cookie
  e redireciona (visitante sem cookie → /login; logado em /login ou /cadastro → /). A
  validação real (token existe, não expirou, usuário não soft-deletado) fica no
  lerSessao() de lib/session.ts, chamado pelos Server Components.
- **Consequências:** o proxy fica leve e sem dependência de banco. Em troca, um cookie
  forjado ou expirado PASSA pelo porteiro — e isso é aceitável porque a "tranca" real é
  o lerSessao(). CONSEQUÊNCIA OPERACIONAL CRÍTICA: toda rota protegida da Fase 3
  (dashboard, check-in, diário, IA, insights, perfil) DEVE chamar lerSessao() e tratar
  o retorno null (redirecionar para /login). Enquanto / for a página estática do Next
  sem lerSessao(), um cookie inválido a deixa visível — tolerável apenas porque não há
  dado sensível ali ainda. Refina/implementa as ADR 0007 e a separação porteiro/tranca.

## ADR 0016 — Biblioteca de ícones: Phosphor (duotone)

- **Data:** 2026-06-03
- **Contexto:** o polimento visual da Fase 6 precisa aproximar a interface da
  apresentação (`docs/referencias/mindlog-apresentacao.pdf`), que usa ícones
  cheios/duotone (cérebro, robô, etc.).
- **Opções consideradas:** (a) `@phosphor-icons/react` (tem pesos `duotone`/`fill`);
  (b) `lucide-react` (mais leve e tree-shakeable, porém só traço).
- **Decisão:** usar `@phosphor-icons/react`. Peso `duotone` no logo (cérebro) e nos
  ícones de card; `regular` onde o traço fino serve. `lucide-react` foi descartada por
  menor fidelidade ao preenchido do deck — a aproximação à apresentação é critério do
  trabalho e justifica o peso extra.
- **Consequências:** dependência um pouco maior que a alternativa de traço; em troca,
  fidelidade visual ao deck.
- **Nota (desvio consciente do briefing):** o briefing pede títulos serifados, mas os
  frames do deck usam **sans-serif** nos títulos internos das telas ("Olá, {nome}",
  "Histórico", "Perguntas frequentes"). Seguimos o deck: títulos internos em Inter
  (sans); a serifada (Lora) fica reservada à marca "MindLog" e a acentos numéricos
  (números dos insights, "Mai 2026").

## ADR 0017 — Largura de coluna por tipo de tela (foco vs. lista/grade)

- **Data:** 2026-06-03
- **Contexto:** a região de conteúdo da área autenticada tem uma largura máxima
  (`max-w-6xl`, ~1152px). Algumas telas são de tarefa única; outras são listas/grades.
- **Opções consideradas:** (a) largura única para tudo; (b) largura por tipo de tela.
- **Decisão:** telas de **tarefa focada** (check-in e edição de entrada do diário) usam
  uma **coluna estreita** (`max-w-xl` / `max-w-2xl`) centralizada; telas de **lista/grade**
  (dashboard, diário, comunidade, insights, suporte, exercícios, perfil) usam a **largura
  padrão** (`max-w-6xl`).
- **Consequências:** foco e legibilidade nas tarefas únicas (Lei de Hick + comprimento de
  linha confortável); melhor aproveitamento do espaço nas listas/grades. Em troca, as
  telas focadas ficam mais estreitas que a barra de topo — exceção consciente. Formaliza a
  decisão que vivia só na mensagem do commit `2ec503b`.

## ADR 0018 — Landing pública em `/` e dashboard movido para `/inicio`

- **Data:** 2026-06-06
- **Contexto:** `/` resolvia para o dashboard autenticado (`(app)/page.tsx`, via route
  group). Queremos uma landing pública profissional para quem chega deslogado, sem
  jogá-lo direto no `/login`. Como a landing precisa ficar fora do `(app)` (sem a
  sidebar) e não podem existir duas páginas resolvendo para `/`, algo tinha de mudar.
- **Opções consideradas:** (a) manter o dashboard em `/` e detectar deslogado para
  trocar o conteúdo — inviável, pois `/` está dentro do layout autenticado com sidebar;
  (b) mover o dashboard para `/inicio` e deixar `/` como página pública (landing);
  (c) pôr a landing em outra URL (ex.: `/sobre`) — pior, pois a raiz é a porta natural.
- **Decisão:** `/` passa a ser **página pública** (`src/app/page.tsx`, fora do `(app)`)
  e o dashboard vai para `/inicio` (`(app)/inicio/page.tsx`, mantendo a sidebar). No
  proxy, `/` entra numa lista `ROTAS_PUBLICAS` e nunca é barrada nem redirecionada pelo
  porteiro. O redirecionamento do visitante já autenticado de `/` para `/inicio` é
  feito **na própria página** com `lerSessao()` (tranca real), não pelo cookie do
  porteiro. Pós-login/cadastro passam a apontar para `/inicio`.
- **Consequências:** preserva a separação porteiro/tranca da ADR 0015 — o proxy segue
  sem tocar o banco, e as rotas autenticadas (`/inicio`, `/chat`, etc.) continuam
  exigindo cookie no porteiro + sessão válida no servidor. Some o ponto fraco apontado
  na ADR 0015 (cookie inválido deixando `/` visível): `/` agora é intencionalmente
  pública e estática, sem dado sensível nem query de usuário. Custo: a URL do dashboard
  mudou de `/` para `/inicio` (links internos e redirects ajustados no mesmo commit).
  Refina a ADR 0015.

## ADR 0019 — Troca de plano sem pagamento, com AuditLog

- **Data:** 2026-06-07
- **Contexto:** o briefing prevê o plano editável em desenvolvimento e a ADR 0004
  define que não há gateway de pagamento. Precisávamos de uma página de planos que
  permitisse trocar `Usuario.planoId` de verdade no banco, sem cobrança.
- **Opções consideradas:** (a) troca direta no banco via Server Action, sem pagamento;
  (b) simular um fluxo de checkout/pagamento fake; (c) deixar o plano só editável por
  seed/script. Escolhemos (a): é honesto quanto ao escopo e exercita escrita auditada.
- **Decisão:** rota `/planos` (autenticada) com vitrine dos 3 planos lidos da tabela
  `Plano`. A action `trocarPlano` valida o plano contra o banco, recusa o plano atual,
  respeita soft delete (`updateMany where deletadoEm:null`) e registra `TROCAR_PLANO`
  no `AuditLog`, tudo em transação. A UI deixa explícito que a troca é imediata e sem
  cobrança. Preço e benefícios são ilustrativos na UI (não há coluna de preço no
  schema); o **limite de IA** continua vindo do banco (`Plano.limiteMsgIaDia`).
- **Consequências:** trocar o plano muda o comportamento por construção — o limite
  (`lib/planos.statusLimiteIa`) lê o plano atual via `lerSessao()`; a action revalida
  `/chat` e `/perfil` para refletir na hora. Não há dependência de cobrança. Custo: o
  preço fica fora do banco (decisão consciente); se um dia precisar ser persistido,
  exige migração. Alinha-se à ADR 0004 e à ADR 0005 (soft delete).

## ADR 0020 — Busca no diário: descriptografar-e-filtrar (texto) + SQL (período)

- **Data:** 2026-06-07
- **Contexto:** `EntradaDiario.conteudo` é cifrado com **AES-256-GCM e IV aleatório por
  registro** (`crypto.ts`: `randomBytes(12)`). Logo o ciphertext é **não-determinístico**
  — o mesmo texto vira bytes diferentes a cada gravação. Precisávamos de busca no diário.
- **Por que `LIKE`/índice não servem:** índices e `LIKE`/`=` casam **bytes** no banco.
  Sobre GCM com IV aleatório não há bytes estáveis para indexar nem comparar — a busca
  por SQL no `conteudo` é impossível por construção (essa é justamente a proteção em
  repouso). Só colunas **em claro** (`criadoEm`) são filtráveis no banco.
- **Decisão:** duas vias combinadas. **Texto:** descriptografar-e-filtrar no servidor —
  carrega só os diários do usuário da sessão (`deletadoEm:null`), descriptografa em
  memória, normaliza (lowercase + remoção de acento via NFD) e filtra por substring; o
  texto puro **nunca** é logado nem persistido. **Período:** `criadoEm` está em claro,
  então o intervalo é filtrado no banco via Prisma `where` (limites de dia no fuso SP).
- **Limitação de performance:** a busca textual é **O(n)** nos diários do usuário e
  exige descriptografar todos a cada consulta — aceitável na escala deste projeto
  (um diário pessoal), mas não escala para milhões de registros.
- **Alternativa de produção:** **blind index** — guardar, ao lado do ciphertext, um
  `HMAC(chave_separada, texto_normalizado)` indexável. Permite **match exato** por
  igualdade de hash sem decifrar, mas: só igualdade (não substring), exige uma chave
  separada da de cifragem e **vaza frequência** (valores iguais geram o mesmo hash). Fora
  do escopo acadêmico atual.
- **Fora do escopo desta feature (decisões conscientes):**
  - **Tags:** adiadas de propósito. Seriam um modelo **N:N próprio** (estilo `Curtida`)
    com migração de schema — não faz sentido misturar isso com a feature de busca.
  - **Humor:** adiado. A relação `EntradaDiario.registroHumorId → RegistroHumor.humor`
    existe no schema (Int em claro, filtrável), mas o fluxo de criação **nunca popula**
    esse vínculo — um filtro retornaria sempre vazio. Limitação conhecida / trabalho
    futuro (linkar humor↔diário antes de oferecer o filtro).

## ADR 0021 — Tags do diário: N:N (Tag + EntradaDiarioTag) escopadas ao usuário

- **Data:** 2026-06-07
- **Contexto:** o diário precisava de tags para organizar e filtrar entradas. O ADR 0020
  já previa tags como modelo próprio (não misturar com a busca textual). Agora as
  implementamos.
- **Opções consideradas:** (a) tags como string única na entrada (CSV) — simples, mas
  sem dedup, sem agregação e sem integridade; (b) **N:N** com tabela `Tag` +
  junção `EntradaDiarioTag`, espelhando `Curtida`; (c) array nativo — SQLite não tem.
- **Decisão:** (b). `Tag(id, usuarioId, nome, criadoEm, @@unique([usuarioId, nome]))` e
  a junção `EntradaDiarioTag` com **PK composta** `@@id([entradaDiarioId, tagId])` e
  `onDelete: Cascade` nos dois lados — igual ao padrão de `Curtida`. Migração **aditiva**
  (`add_tags`, só `CREATE TABLE`). Anexar usa `connectOrCreate` **sempre escopado ao
  `usuarioId` da sessão** (privacidade: nunca se conecta à tag de outro usuário). A
  busca por tag vira **SQL real** (`where { tags: { some: { tag: { nome } } } }`),
  combinável com texto (decrypt-and-filter) e período.
- **`nome` em claro (trade-off consciente):** ao contrário do corpo do diário (cifrado),
  o nome da tag fica **em texto** para ser **pesquisável e agregável** (filtro + groupBy
  de "tags mais usadas"). É o mesmo princípio do `RegistroHumor.humor` (ADR 0008):
  agregação vs. sigilo. Tags podem revelar tema sensível, então ficam **escopadas ao
  titular**, entram na **exportação de dados** (portabilidade) e são apagadas junto com
  a entrada/usuário via `onDelete: Cascade`. Registrado em `docs/lgpd.md`.
- **Normalização/dedup:** `trim` + `lowercase` + colapso de espaços (remove `#` inicial,
  limita tamanho). **Acentos são preservados** — escolhemos NÃO fazer accent-folding,
  então **"saúde" e "saude" são tags distintas** e podem coexistir. Trade-off: mais fiel
  ao que o usuário digitou (não mutila o acento), ao custo de possíveis quase-duplicatas;
  o accent-folding mergiria as duas, mas perderia o acento no rótulo exibido.
- **Consequências:** dedup por usuário garantida pelo `@@unique`; tags órfãs (sem
  vínculo) podem sobrar após edição — aceitável (viram sugestões reutilizáveis). Espelha
  `Curtida`, mantendo o schema consistente.

---

## Como adicionar uma nova decisão

Copie o template abaixo, incremente o número (próximo: **0022**), use a data de hoje e
mantenha a entrada curta (4–8 linhas). Ao registrar uma mudança de escopo, atualize
também o `briefing.md`. Decisões que substituem outras devem citar o ADR que tornam
obsoleto (ex.: "Substitui ADR 0002").

```markdown
## ADR NNNN — Título curto

- **Data:** AAAA-MM-DD
- **Contexto:** qual problema/necessidade motivou a decisão.
- **Opções consideradas:** (a) ...; (b) ...; (c) ...
- **Decisão:** o que foi decidido.
- **Consequências:** efeitos esperados, positivos e negativos (trade-offs).
```
