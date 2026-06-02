# MindLog

Diário emocional digital que combina **check-in de humor**, **diário pessoal**, uma
**"psicóloga IA"** (mockada) e uma pequena **comunidade**, com foco em autoconhecimento
e bem-estar no dia a dia.

> **Projeto acadêmico** (UNIFRAN, disciplina de UX/UI). Algumas partes são
> intencionalmente simplificadas (ver _Escopo_ abaixo). O MindLog **não substitui**
> acompanhamento profissional de saúde mental. Em caso de crise, ligue para o **CVV: 188**.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** (paleta e fontes do projeto)
- **Prisma 7** + **SQLite** (com `@prisma/adapter-better-sqlite3`)
- **Argon2id** (`@node-rs/argon2`) para hash de senha
- Sessão por **cookie HTTP-only** com estado no banco
- **AES-256-GCM** para criptografia em repouso de campos sensíveis

## Pré-requisitos

- **Node.js ≥ 20.9** (desenvolvido em Node 26)
- npm

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env a partir do exemplo
cp .env.example .env

# 3. Gerar uma chave de criptografia (32 bytes) e colá-la em ENCRYPTION_KEY no .env
openssl rand -base64 32

# 4. Criar o banco e aplicar as migrations
npx prisma migrate dev

# 5. Gerar o Prisma Client e popular os planos (caso o passo 4 não tenha populado)
npx prisma generate
npx prisma db seed

# 6. Rodar em desenvolvimento
npm run dev
```

Acesse <http://localhost:3000>. Crie uma conta em `/cadastro` (login automático) e explore.

Para inspecionar o banco: `npx prisma studio`.

## Variáveis de ambiente

Definidas no `.env` (ignorado pelo git). Veja `.env.example`.

| Variável         | Descrição                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`   | Caminho do SQLite. Padrão: `file:./prisma/dev.db`.                        |
| `ENCRYPTION_KEY` | Chave AES-256 (32 bytes em base64) para os campos sensíveis. Obrigatória. |

## Scripts

| Comando                | O que faz                                  |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Servidor de desenvolvimento                |
| `npm run build`        | Build de produção                          |
| `npm run start`        | Servidor de produção (após o build)        |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Formata o código com Prettier              |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

## Estrutura

```
src/
  app/
    (auth)/        # cadastro, login, logout
    (app)/         # área autenticada: dashboard, check-in, diário, chat,
                   # insights, comunidade, exercícios, suporte, perfil
  components/      # componentes compartilhados
  data/            # conteúdo estático (exercícios, FAQ do suporte)
  lib/             # db, auth, sessão, crypto, datas, insights, planos, ai-mock
  generated/       # Prisma Client gerado (ignorado pelo git)
  proxy.ts         # guarda de rotas (middleware do Next 16)
prisma/            # schema, migrations e seed
docs/              # schema, decisões (ADRs) e LGPD
```

## Funcionalidades

- **Autenticação** real (cadastro, login, logout) com hash de senha e sessão por cookie.
- **Check-in de humor** (escala 1–4) com nota opcional.
- **Diário** com criar/editar/apagar (soft delete) e histórico.
- **Chat com IA mockada** (respostas locais por palavra-chave; sem API externa).
- **Insights** com agregações SQL (humor médio, dias seguidos, totais) e gráfico.
- **Comunidade** com posts e curtidas.
- **Exercícios** e **Suporte** (conteúdo estático; CVV em destaque).
- **Perfil** com edição, **exportação de dados** (LGPD) e **exclusão de conta**.

## Escopo acadêmico (o que é simplificado)

- **IA mockada** — sem chamada a LLM externo.
- **Sem** recuperação de senha por e-mail, OAuth ou MFA.
- **Sem** pagamento real (os planos existem como dados, com limite de uso).
- **Criptografia em repouso** no servidor (não ponta a ponta verdadeira).

Detalhes e justificativas em `docs/decisoes.md` (ADRs) e `docs/lgpd.md`.

## Documentação

- [`briefing.md`](./briefing.md) — visão de produto e escopo (fonte de verdade).
- [`PLAN.md`](./PLAN.md) — roadmap por fases.
- [`docs/schema.md`](./docs/schema.md) — modelagem do banco.
- [`docs/decisoes.md`](./docs/decisoes.md) — registro de decisões (ADRs).
- [`docs/lgpd.md`](./docs/lgpd.md) — tratamento de dados e LGPD.

## Capturas de tela

_A adicionar._

## Licença

Ver [`LICENSE`](./LICENSE).
