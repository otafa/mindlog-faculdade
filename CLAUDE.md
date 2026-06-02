# CLAUDE.md — MindLog

Arquivo de referência para agentes de IA e colaboradores. Para o contexto completo
de produto, persona, telas e princípios de UX, ver `briefing.md` (fonte de verdade).

## O que é

MindLog é um **diário emocional** que combina três funções: check-in de humor
diário, diário pessoal com histórico, e chat com uma "psicóloga IA". É um **projeto
acadêmico** (UNIFRAN, UX/UI), não um produto comercial.

**Foco do projeto:** aprender **modelagem e operação de banco de dados** em um
contexto realista, incluindo considerações de LGPD para dados sensíveis de saúde
mental. As demais partes são intencionalmente simplificadas.

## Stack

- **Next.js (App Router) + TypeScript** — frontend e rotas de API no mesmo projeto.
- **Tailwind CSS** — estilização.
- **Prisma + SQLite** — banco com schema declarativo e type-safety. Migrar para
  PostgreSQL só se sobrar tempo.
- **bcrypt/argon2** para hash de senha; **cookie de sessão HTTP-only** para auth.

## O que é mock vs. real

- **IA é mockada.** Sem chamadas a API externa de LLM. As respostas da "psicóloga IA"
  vêm de respostas pré-escritas ou de regras simples por palavra-chave. A IA **não é**
  o foco do projeto.
- **Login é real, mas simplificado.** Cadastro e autenticação funcionam de verdade
  (hash de senha, sessão por cookie) porque integram com o banco — isso é parte do
  aprendizado. Fora do escopo: OAuth, recuperação de senha por e-mail, MFA.
- Sem pagamento real, sem moderação real de comunidade, sem criptografia ponta a ponta
  verdadeira (apenas criptografia em repouso de campos sensíveis).

## LGPD (parte do escopo)

Diário emocional é **dado sensível** (saúde). Demonstrar consciência disso é um
diferencial do projeto. Compromissos a implementar e documentar em `docs/lgpd.md`:

- Consentimento explícito no cadastro.
- Direito de acesso, portabilidade (exportar dados) e esquecimento (apagar conta via
  soft delete + anonimização).
- Minimização (não pedir CPF, telefone, endereço).
- `AuditLog` para alterações em dados sensíveis; criptografia em repouso com chave em
  variável de ambiente (nunca commitada).

## Regras de trabalho

- **Planejar antes de codar.** Pensar na modelagem e no fluxo antes de implementar.
- **Sempre explicar trade-offs** ao propor uma solução (alternativas e o porquê da
  escolha). Registrar decisões fora do escopo em `docs/decisoes.md`.
- **Commits pequenos e descritivos**, um por mudança lógica.
- **Manter o `PLAN.md` atualizado:** ao concluir uma feature, marcar o item
  correspondente como `- [x]` no **mesmo commit** da feature. Não deixar acumular.
- Mudanças de escopo significativas: refletir em `briefing.md` e registrar em
  `docs/decisoes.md` com data e motivo.
