# docs/schema.md — Modelagem do banco do MindLog

Modelagem textual das entidades **antes** de escrever `schema.prisma`. É uma etapa
deliberada: o foco do projeto é aprender modelagem de banco, então decidimos a estrutura
em linguagem natural primeiro e só depois traduzimos para Prisma.

Fonte de verdade do escopo: `briefing.md`.

## Convenções gerais

- **Banco:** SQLite via Prisma. Importante: SQLite tem tipagem limitada — não há tipo
  nativo `Decimal`/`Enum`/`Json` rico nem `uuid()` no banco. Enums do Prisma são
  emulados como texto no SQLite mas dão type-safety no TypeScript; UUID/CUID são gerados
  pela aplicação.
- **Chave primária:** `id` do tipo `String` (CUID gerado pelo Prisma) em todas as
  entidades, salvo as tabelas de referência (ver `Plano`). Justificativa: CUID não expõe
  contagem/ordem de criação como um inteiro autoincrement faria — relevante para um app
  de saúde mental onde não queremos vazar volume de usuários por IDs sequenciais.
- **Timestamps:** `criadoEm` (default `now()`) e `atualizadoEm` (`@updatedAt`) em
  entidades mutáveis.
- **Soft delete:** campo `deletadoEm DateTime?` (nullable; default nulo = ativo).
  Aplicado apenas a entidades que precisam de reversão/auditoria (ver seção dedicada).
- **Criptografia em repouso:** campos marcados **🔒 cripto** são criptografados pela
  aplicação antes de gravar (chave em `ENCRYPTION_KEY`, nunca commitada). No banco ficam
  como texto cifrado. Consequência importante: **não dá para indexar nem buscar por
  conteúdo** nesses campos.
- **Marcação SENSÍVEL:** dado de saúde sob LGPD (art. 5º, II). Exige cuidado extra
  (criptografia, auditoria, minimização).

---

## 1. Usuario

**Propósito:** representa a pessoa cadastrada e dona de todos os dados do app.

| Campo            | Tipo      | Nullable | Default   | Observações |
|------------------|-----------|----------|-----------|-------------|
| id               | String    | não      | cuid()    | PK |
| nome             | String    | não      | —         | exibido na saudação |
| email            | String    | não      | —         | login; **único** |
| senhaHash        | String    | não      | —         | hash bcrypt/argon2 — nunca a senha em claro |
| planoId          | String    | não      | "semente" | FK → Plano.id |
| consentimentoEm  | DateTime  | não      | —         | quando aceitou os termos (LGPD) |
| criadoEm         | DateTime  | não      | now()     | |
| atualizadoEm     | DateTime  | não      | @updatedAt| |
| deletadoEm       | DateTime? | sim      | null      | soft delete |

- **PK:** `id`.
- **FK:** `planoId` → `Plano.id`.
- **Relações:**
  - 1:N com `Sessao`, `RegistroHumor`, `EntradaDiario`, `SessaoChat`, `Post`, `AuditLog`
    (um usuário tem muitos de cada).
  - N:1 com `Plano` (muitos usuários para um plano).
- **Índices:** `@unique(email)` — obrigatório para login e para impedir duplicidade.
  Índice em `planoId` (FK usada em filtros/contagem por plano).
- **Sensível?** Os campos de identificação (nome, email) são dados pessoais comuns, não
  "sensíveis" no sentido do art. 5º — não criptografados, mas sujeitos a minimização.
  `senhaHash` nunca é exposto via API.
- **Soft delete:** **sim.** Direito ao esquecimento via soft delete + anonimização.
  No soft delete, os campos são sobrescritos assim: `nome` → `"Usuário removido"`;
  `email` → `"deletado-{cuid}@anon.local"` (preserva a constraint `@unique`);
  `senhaHash` → `"!"` (valor inválido fixo que nenhum hash gera, inviabiliza login).
  **Carência de 30 dias** entre o soft delete e a remoção física, executada por um
  **script manual** (sem job automático no escopo).

## 2. Sessao

**Propósito:** sessão de autenticação ativa, referenciada pelo cookie HTTP-only.

| Campo       | Tipo      | Nullable | Default | Observações |
|-------------|-----------|----------|---------|-------------|
| id          | String    | não      | cuid()  | PK; usado como token de sessão |
| usuarioId   | String    | não      | —       | FK → Usuario.id |
| expiraEm    | DateTime  | não      | —       | expiração da sessão |
| criadoEm    | DateTime  | não      | now()   | |

- **PK:** `id`. **FK:** `usuarioId` → `Usuario.id` (onDelete: Cascade).
- **Relações:** N:1 com `Usuario`.
- **Índices:** índice em `usuarioId` (listar/revogar sessões do usuário); índice em
  `expiraEm` para limpeza de expiradas.
- **Sensível?** Não armazena conteúdo sensível, mas o `id` é um segredo (token) —
  transita só em cookie HTTP-only, nunca em URL/log.
- **Soft delete:** **não.** Sessão é efêmera; logout/expiração apaga fisicamente.

## 3. Plano (tabela de referência)

**Propósito:** os três níveis de plano (Semente, Equilíbrio, Florescer) como dados.

| Campo            | Tipo    | Nullable | Default | Observações |
|------------------|---------|----------|---------|-------------|
| id               | String  | não      | —       | PK, slug estável: "semente"/"equilibrio"/"florescer" |
| nome             | String  | não      | —       | rótulo exibido |
| limiteMsgIaDia   | Int?    | sim      | null    | limite diário de mensagens de IA; null = ilimitado |
| descricao        | String? | sim      | null    | texto curto do plano |

- **PK:** `id` (slug textual, não cuid — é referência estável usada em código).
- **Relações:** 1:N com `Usuario`.
- **Índices:** PK basta (tabela minúscula).
- **Sensível?** Não.
- **Soft delete:** **não** (dado de referência; sem volume, sem necessidade).
- **Decisão não-óbvia:** modelado como **tabela** (e não enum) porque o briefing pede
  "estrutura de planos refletida no banco como tabela" e porque limites por plano viram
  dados consultáveis. Alternativa (enum + config em código) descartada por isso.
- **Carga inicial:** os três planos são inseridos via **seed do Prisma** (não via
  migration). Limites: `semente` → `limiteMsgIaDia: 40`; `equilibrio` e `florescer` →
  `limiteMsgIaDia: null` (ilimitado).

## 4. RegistroHumor

**Propósito:** check-in rápido de humor do dia, com nota opcional. **SENSÍVEL.**

| Campo       | Tipo      | Nullable | Default | Observações |
|-------------|-----------|----------|---------|-------------|
| id          | String    | não      | cuid()  | PK |
| usuarioId   | String    | não      | —       | FK → Usuario.id |
| humor       | Int       | não      | —       | escala 1–4 (Mal..Muito bem); validado na aplicação |
| nota        | String?   | sim      | null    | **🔒 cripto** — nota curta opcional |
| criadoEm    | DateTime  | não      | now()   | timestamp do check-in |
| deletadoEm  | DateTime? | sim      | null    | soft delete |

- **PK:** `id`. **FK:** `usuarioId` → `Usuario.id` (onDelete: Cascade).
- **Relações:** N:1 com `Usuario`.
- **Índices:** índice composto `(usuarioId, criadoEm)` — consultas de insights são sempre
  "registros deste usuário ordenados/filtrados por data" (humor médio dos últimos 7 dias,
  dias seguidos).
- **Sensível?** **Sim.** O valor `humor` é dado de saúde mas é numérico e precisa ser
  agregável via SQL (`AVG`, `COUNT`) → **não criptografado** (criptografar impediria os
  insights). A `nota` é texto livre → **🔒 criptografada**. Esse trade-off
  (agregação vs. sigilo) será documentado em `docs/lgpd.md`.
- **Soft delete:** **sim** (auditoria/reversão de dado sensível).

## 5. EntradaDiario

**Propósito:** texto livre que o usuário escreve sobre o dia. **SENSÍVEL.**

| Campo          | Tipo      | Nullable | Default | Observações |
|----------------|-----------|----------|---------|-------------|
| id             | String    | não      | cuid()  | PK |
| usuarioId      | String    | não      | —       | FK → Usuario.id |
| registroHumorId| String?   | sim      | null    | FK → RegistroHumor.id; **@unique** (1:1 opcional) |
| conteudo       | String    | não      | —       | **🔒 cripto** — texto do diário |
| criadoEm       | DateTime  | não      | now()   | |
| atualizadoEm   | DateTime  | não      | @updatedAt | entradas são editáveis |
| deletadoEm     | DateTime? | sim      | null    | soft delete |

- **PK:** `id`. **FKs:** `usuarioId` → `Usuario.id` (Cascade); `registroHumorId` →
  `RegistroHumor.id` (nullable + **@unique**; SetNull).
- **Relações:** N:1 com `Usuario`; **1:1 opcional** com `RegistroHumor` — a FK
  `registroHumorId` é `@unique`, garantindo que cada check-in tenha no máximo uma entrada
  de diário associada. A entrada também pode ser independente (FK nula), conforme o
  briefing ("pode estar ligada a um check-in do mesmo dia ou ser independente").
- **Índices:** índice composto `(usuarioId, criadoEm)` para o histórico lateral por data.
- **Sensível?** **Sim**, núcleo do dado de saúde. `conteudo` **🔒 criptografado**.
- **Soft delete:** **sim** — o briefing pede que o usuário possa apagar entradas próprias,
  e auditoria exige rastro.

## 6. SessaoChat

**Propósito:** uma conversa com a IA mockada; agrupa várias mensagens.

| Campo       | Tipo      | Nullable | Default | Observações |
|-------------|-----------|----------|---------|-------------|
| id          | String    | não      | cuid()  | PK |
| usuarioId   | String    | não      | —       | FK → Usuario.id |
| titulo      | String?   | sim      | null    | rótulo opcional da conversa |
| criadoEm    | DateTime  | não      | now()   | |
| atualizadoEm| DateTime  | não      | @updatedAt | move ao chegar nova mensagem |
| deletadoEm  | DateTime? | sim      | null    | soft delete |

- **PK:** `id`. **FK:** `usuarioId` → `Usuario.id` (Cascade).
- **Relações:** N:1 com `Usuario`; 1:N com `MensagemChat` (uma conversa, muitas mensagens).
- **Índices:** índice `(usuarioId, atualizadoEm)` para listar conversas recentes.
- **Sensível?** Não guarda conteúdo diretamente, mas é o agrupador de mensagens sensíveis.
- **Soft delete:** **sim** (apagar uma conversa deve preservar rastro de auditoria).

## 7. MensagemChat

**Propósito:** uma mensagem dentro de uma conversa (do usuário ou da IA). **SENSÍVEL.**

| Campo        | Tipo      | Nullable | Default | Observações |
|--------------|-----------|----------|---------|-------------|
| id           | String    | não      | cuid()  | PK |
| sessaoChatId | String    | não      | —       | FK → SessaoChat.id |
| autor        | AutorMensagem | não  | —       | enum `{ USUARIO, IA }` — type-safe no TS |
| conteudo     | String    | não      | —       | **🔒 cripto** — texto da mensagem |
| criadoEm     | DateTime  | não      | now()   | ordena a conversa |
| deletadoEm   | DateTime? | sim      | null    | soft delete (segue a conversa) |

- **PK:** `id`. **FK:** `sessaoChatId` → `SessaoChat.id` (Cascade).
- **Enum:** `AutorMensagem { USUARIO, IA }` — enum do Prisma para type-safety no
  TypeScript (evita strings mágicas ao renderizar mensagem do usuário vs. da IA).
- **Relações:** N:1 com `SessaoChat`. (Acesso ao usuário é indireto via `SessaoChat`.)
- **Índices:** índice `(sessaoChatId, criadoEm)` para reconstruir a conversa em ordem.
- **Sensível?** **Sim.** Mesmo as respostas da IA refletem o que o usuário disse →
  `conteudo` **🔒 criptografado**.
- **Soft delete:** **sim**, acompanhando a conversa.

## 8. Post (Comunidade — Onda 3)

**Propósito:** post curto no feed da comunidade, com curtidas.

| Campo       | Tipo      | Nullable | Default | Observações |
|-------------|-----------|----------|---------|-------------|
| id          | String    | não      | cuid()  | PK |
| usuarioId   | String    | não      | —       | FK → Usuario.id |
| conteudo    | String    | não      | —       | texto curto, público |
| criadoEm    | DateTime  | não      | now()   | |
| deletadoEm  | DateTime? | sim      | null    | soft delete |

- **PK:** `id`. **FK:** `usuarioId` → `Usuario.id` (Cascade).
- **Relações:** N:1 com `Usuario`; 1:N com `Curtida`. A contagem de curtidas é derivada
  (`COUNT` na tabela `Curtida`), não um campo materializado.
- **Índices:** índice em `criadoEm` (feed ordenado por mais recente).
- **Sensível?** **Não** — conteúdo é público e voluntário. Por ser público, **não é
  criptografado** (precisa ser lido por outros usuários).
- **Soft delete:** **sim** (remover post mantendo rastro).
- **Nota:** comentários estão fora do escopo inicial (briefing).

## 8.1. Curtida (junção N:N — Onda 3)

**Propósito:** tabela de junção entre `Usuario` e `Post` que representa uma curtida.

| Campo       | Tipo      | Nullable | Default | Observações |
|-------------|-----------|----------|---------|-------------|
| usuarioId   | String    | não      | —       | FK → Usuario.id; parte da PK composta |
| postId      | String    | não      | —       | FK → Post.id; parte da PK composta |
| criadoEm    | DateTime  | não      | now()   | quando curtiu |

- **PK composta:** `@@id([usuarioId, postId])` — impede curtida duplicada **por
  construção** (o mesmo usuário não cria duas linhas para o mesmo post).
- **FKs:** `usuarioId` → `Usuario.id` (Cascade); `postId` → `Post.id` (Cascade).
- **Relações:** modela o N:N entre `Usuario` e `Post`.
- **Índices:** a PK composta já cobre as buscas por `usuarioId`. Índice adicional em
  `postId` para contar curtidas de um post (`COUNT`) e checar estado do feed.
- **Sensível?** Não.
- **Soft delete:** **não.** Descurtir = remover fisicamente a linha (operação reversível
  recriando-a). Estado "curtido por este usuário" = existência da linha.

## 9. AuditLog

**Propósito:** trilha de auditoria de alterações em dados sensíveis (exigência LGPD).

| Campo        | Tipo      | Nullable | Default | Observações |
|--------------|-----------|----------|---------|-------------|
| id           | String    | não      | cuid()  | PK |
| usuarioId    | String?   | sim      | null    | FK → Usuario.id (null se usuário já removido) |
| acao         | String    | não      | —       | ex.: "CRIAR_DIARIO", "APAGAR_CONTA" |
| entidade     | String    | não      | —       | ex.: "EntradaDiario" |
| entidadeId   | String?   | sim      | null    | id do registro afetado |
| criadoEm     | DateTime  | não      | now()   | timestamp do evento |

- **PK:** `id`. **FK:** `usuarioId` → `Usuario.id` (onDelete: SetNull — preserva o log
  mesmo após remoção física do usuário).
- **Relações:** N:1 opcional com `Usuario`.
- **Índices:** índice `(usuarioId, criadoEm)` e índice em `entidade` para consultas de
  auditoria.
- **Sensível?** O log registra **metadados** (qual ação, qual entidade, quando) e
  **nunca o conteúdo** do dado sensível. Por isso não é criptografado.
- **Soft delete:** **não.** Log é append-only e imutável — apagar contradiz o propósito
  de auditoria.

---

## Resumo: criptografia e soft delete

| Entidade       | SENSÍVEL | Campos 🔒 cripto      | Soft delete (`deletadoEm`) |
|----------------|----------|-----------------------|----------------------------|
| Usuario        | parcial  | —                     | sim |
| Sessao         | não      | —                     | não |
| Plano          | não      | —                     | não |
| RegistroHumor  | sim      | nota                  | sim |
| EntradaDiario  | sim      | conteudo              | sim |
| SessaoChat     | indireto | —                     | sim |
| MensagemChat   | sim      | conteudo              | sim |
| Post           | não      | —                     | sim |
| Curtida        | não      | —                     | não |
| AuditLog       | não      | —                     | não (append-only) |

---

## Timezone

**Decisão:** armazenar todo `DateTime` em **UTC** (default do Prisma) e converter para
**`America/Sao_Paulo`** apenas no momento de **exibir** e de **agrupar dados por dia**.

**Por quê:** os insights agregam por dia (humor médio dos últimos 7 dias, "dias seguidos"
de check-in). Se agrupássemos pelos timestamps UTC crus, um check-in feito perto da
meia-noite no horário de Brasília cairia no dia seguinte em UTC, bagunçando a contagem de
dias e a janela de 7 dias. Por isso a conversão de fuso acontece na borda de
apresentação/agregação, não no armazenamento.

**Consequência prática:** queries de agregação por dia devem aplicar o offset de
`America/Sao_Paulo` antes do `GROUP BY`/comparação de data (na aplicação ou na própria
query), nunca comparar a data local do servidor diretamente com o `DateTime` em UTC.

---

## Decisões tomadas

Resolvidas as questões da modelagem (substituem a antiga seção "Perguntas em aberto"):

1. **Humor como `Int` (1–4).** Agregações via SQL (`AVG`, `COUNT`) — parte do aprendizado
   de banco. Validação dos valores 1–4 na camada de aplicação.
2. **Humor não criptografado; `nota` textual criptografada.** Trade-off agregação vs.
   sigilo será documentado em `docs/lgpd.md`.
3. **`Plano.id` permanece string slug** (PK estável referenciada em código).
   **`MensagemChat.autor` vira enum do Prisma** `AutorMensagem { USUARIO, IA }` para
   type-safety no TypeScript.
4. **Curtidas como tabela N:N `Curtida { usuarioId, postId, criadoEm }`** com PK composta
   `@@id([usuarioId, postId])` — impede curtida duplicada por construção, permite
   descurtir e exibir estado por usuário.
5. **Anonimização no soft delete de `Usuario`:** `nome` → `"Usuário removido"`; `email` →
   `"deletado-{cuid}@anon.local"` (preserva `@unique`); `senhaHash` → `"!"` (valor
   inválido fixo). Carência de **30 dias** até a remoção física, via **script manual**
   (sem job automático no escopo).
6. **`EntradaDiario.registroHumorId` opcional + `@unique`** → 1:1 opcional. Cada check-in
   tem no máximo uma entrada de diário associada.
7. **IDs como CUID** (não autoincrement) — não vaza volume por IDs sequenciais.
8. **`Sessao` como tabela** — permite revogação, listagem e cleanup de expiradas.
9. **Limites de plano via seed do Prisma** (não migration): `semente` →
   `limiteMsgIaDia: 40`; `equilibrio` e `florescer` → `null` (ilimitado).
10. **Exercícios e Suporte** são JSON estático em `src/data/` — **fora do schema**.
11. **Timezone:** `DateTime` em UTC, conversão para `America/Sao_Paulo` na exibição e no
    agrupamento por dia (ver seção acima).
