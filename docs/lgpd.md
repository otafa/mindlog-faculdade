# docs/lgpd.md — Tratamento de dados e LGPD no MindLog

Como o MindLog lida com a Lei Geral de Proteção de Dados (Lei 13.709/2018) em termos
práticos. Este documento é **honesto sobre o escopo acadêmico**: descreve o que está
implementado, o que é simplificado e o que faltaria para produção real. Não declara
conformidade plena — declarar isso seria falso para um projeto de faculdade.

Referências: `briefing.md` (escopo), `docs/schema.md` (modelagem), `docs/decisoes.md`.

---

## 1. Categorização dos dados coletados

A LGPD distingue **dados pessoais** de **dados pessoais sensíveis** (art. 5º, I e II).
Dado sensível inclui o que se refere à **saúde** do titular — e um diário emocional é
exatamente isso. Por isso parte dos nossos dados exige tratamento reforçado.

| Dado | Entidade | Classificação (art. 5º LGPD) |
|------|----------|------------------------------|
| Nome, e-mail | `Usuario` | Dado pessoal (inciso I) |
| Senha (em hash) | `Usuario.senhaHash` | Credencial — nunca em claro |
| Registro de humor | `RegistroHumor.humor` | **Sensível** — saúde (inciso II) |
| Nota do check-in | `RegistroHumor.nota` | **Sensível** — saúde |
| Texto do diário | `EntradaDiario.conteudo` | **Sensível** — saúde |
| Mensagens com a IA | `MensagemChat.conteudo` | **Sensível** — refletem estado emocional |
| Posts da comunidade | `Post.conteudo` | Dado pessoal **público** (voluntário) |

**Minimização (art. 6º, III):** coletamos apenas o necessário. Não pedimos CPF,
telefone, endereço, data de nascimento nem geolocalização.

## 2. Base legal

A base legal utilizada é o **consentimento explícito** do titular (art. 7º, I, e art. 11,
I para dados sensíveis, que exige consentimento "específico e destacado").

- No cadastro há um checkbox obrigatório de aceite dos termos, com link para a política
  de privacidade. Sem o aceite, a conta não é criada.
- O momento do consentimento é registrado em `Usuario.consentimentoEm` (timestamp),
  servindo como prova de quando o titular concordou.
- **Limitação honesta:** é uma base legal *hipotética* para fins didáticos. Não há
  versionamento da política nem re-consentimento quando os termos mudam (ver seção 6).

## 3. Direitos do titular implementados

Mapeamento dos direitos do titular (art. 18) para funcionalidades do app:

- **Acesso (art. 18, II):** a tela de perfil permite ao usuário visualizar seus dados
  pessoais a qualquer momento.
- **Retificação (art. 18, III):** o usuário pode editar o nome no perfil e editar/corrigir
  entradas de diário próprias.
- **Portabilidade (art. 18, V):** botão "Exportar meus dados" gera um JSON com todos os
  registros do usuário (check-ins, diário, conversas) e baixa no navegador. Os campos
  sensíveis são descriptografados na exportação, pois vão para o próprio titular.
- **Exclusão / eliminação (art. 18, VI):** botão "Apagar minha conta" com confirmação em
  duas etapas. Implementa o direito ao esquecimento via **soft delete + anonimização**
  imediata, com remoção física após carência de 30 dias.
- **Informação (art. 18, I e VII):** a política de privacidade informa quais dados são
  tratados e com qual finalidade; pontos da interface deixam claro que a IA não substitui
  terapeuta humano.

## 4. Medidas técnicas

- **Criptografia em repouso** dos campos sensíveis de texto livre: `RegistroHumor.nota`,
  `EntradaDiario.conteudo`, `MensagemChat.conteudo`. A chave fica em `ENCRYPTION_KEY`
  (variável de ambiente, nunca commitada). Detalhe importante: campos criptografados
  **não são indexáveis nem pesquisáveis** por conteúdo.
- **Decisão consciente sobre o humor:** `RegistroHumor.humor` (Int 1–4) **não é
  criptografado**, porque precisa ser agregável via SQL (`AVG`, `COUNT`) para os insights.
  É um trade-off explícito **agregação vs. sigilo**: aceitamos guardar o valor numérico em
  claro para viabilizar as estatísticas, enquanto a nota textual associada permanece
  cifrada.
- **Hash de senha:** senhas são armazenadas com bcrypt/argon2 (`Usuario.senhaHash`),
  nunca em texto. No soft delete o hash vira `"!"` (valor inválido que inviabiliza login).
- **Audit log (`AuditLog`):** toda alteração em dado sensível (criar/editar/apagar diário,
  check-in, apagar conta) registra uma linha com ação, entidade, id afetado e timestamp.
  O log guarda **apenas metadados** — nunca o conteúdo sensível — e é append-only.
- **Soft delete:** entidades sensíveis usam `deletadoEm`, permitindo reversão em janela
  curta e mantendo rastro de auditoria. Anonimização do `Usuario`: `nome` →
  `"Usuário removido"`, `email` → `"deletado-{cuid}@anon.local"`.
- **Sessão segura:** autenticação por cookie HTTP-only (mitiga roubo de token via XSS),
  com expiração e possibilidade de revogação via tabela `Sessao`.

## 5. Onde no código (placeholders)

A preencher conforme a implementação avança:

| Medida | Local previsto no código |
|--------|--------------------------|
| Criptografia de campos sensíveis | `lib/crypto.ts` _(TODO)_ |
| Hash/verificação de senha | `lib/auth.ts` _(TODO)_ |
| Sessão por cookie | `lib/session.ts` _(TODO)_ |
| Registro de consentimento | fluxo de cadastro _(TODO)_ |
| Gravação no audit log | `lib/audit.ts` _(TODO)_ |
| Exportar dados (portabilidade) | rota/ação do perfil _(TODO)_ |
| Apagar conta (soft delete + anonimização) | rota/ação do perfil _(TODO)_ |
| Remoção física pós-carência | script manual `scripts/purge.ts` _(TODO)_ |

## 6. Limitações honestas (escopo acadêmico)

Este é um projeto de faculdade. As escolhas abaixo são deliberadamente simplificadas;
demonstrar consciência delas faz parte do valor do trabalho.

**O que NÃO está implementado / é simplificado:**

- **Sem criptografia ponta a ponta verdadeira.** O deck promete E2E, mas implementamos
  apenas criptografia *em repouso* no servidor. Como a chave (`ENCRYPTION_KEY`) está no
  servidor, o operador do sistema tecnicamente poderia descriptografar. E2E real exigiria
  cifragem no cliente com chave derivada da senha do usuário.
- **Sem versionamento de política nem re-consentimento** quando os termos mudarem.
- **Remoção física manual**, via script — não há job automático garantindo o expurgo após
  os 30 dias.
- **Sem controle de acesso de operadores nem logs de quem acessa dados** (não há painel
  administrativo no escopo).
- **Sem registro formal das operações de tratamento (RoPA)** nem relatório de impacto
  (RIPD), que a ANPD pode exigir para dados sensíveis em produção.
- **Sem encarregado (DPO)** designado, nem canal formal de requisições do titular além das
  telas do app.
- **Backups não são criptografados nem têm política de retenção definida.**
- **Enumeração de usuários no cadastro.** Ao cadastrar com um e-mail já existente, o app
  responde "Este e-mail já está cadastrado", o que revela se um e-mail tem conta. É uma
  limitação de privacidade consciente, aceita no escopo acadêmico: escondê-la exigiria um
  fluxo de confirmação por e-mail (sempre responder "verifique sua caixa de entrada"),
  que está fora de escopo. Optamos pela mensagem clara em favor da usabilidade.
- **Política de senha por tamanho (8–128 caracteres), sem exigência de composição**
  (maiúsculas, números, símbolos), conforme a orientação atual do OWASP/NIST — que
  prioriza comprimento e desencoraja regras de composição que pioram a usabilidade.

**O que faltaria para produção real:**

- E2E verdadeiro ou, no mínimo, gestão de chaves em KMS/HSM (não em `.env`).
- DPO designado e canal de atendimento ao titular dentro do prazo legal.
- RoPA e, por se tratar de dado sensível em escala, provável RIPD.
- Política de retenção, backups criptografados e plano de resposta a incidentes
  (notificação à ANPD e ao titular em caso de vazamento — art. 48).
- Versionamento da política de privacidade com re-consentimento.
- Auditoria de acesso de operadores e segregação de ambientes.
