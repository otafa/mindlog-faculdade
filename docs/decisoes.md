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

---

## Como adicionar uma nova decisão

Copie o template abaixo, incremente o número (próximo: **0014**), use a data de hoje e
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
