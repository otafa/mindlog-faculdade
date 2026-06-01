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

---

## Como adicionar uma nova decisão

Copie o template abaixo, incremente o número (próximo: **0006**), use a data de hoje e
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
