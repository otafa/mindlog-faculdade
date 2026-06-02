"use client";

import { useActionState, useState } from "react";
import { cadastrar, type EstadoCadastro } from "./actions";

const ESTADO_INICIAL: EstadoCadastro = {};

export default function PaginaCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, ESTADO_INICIAL);

  // Validação no cliente apenas para UX — o servidor é a autoridade.
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const senhasDiferem = confirmacao.length > 0 && senha !== confirmacao;

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <h1>Criar conta</h1>
      <p>Comece seu diário emocional no MindLog.</p>

      <form action={acao} noValidate>
        <label>
          Nome
          <input
            name="nome"
            type="text"
            required
            defaultValue={estado.valores?.nome}
            autoComplete="name"
          />
          {estado.erros?.nome && <span role="alert">{estado.erros.nome}</span>}
        </label>

        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            defaultValue={estado.valores?.email}
            autoComplete="email"
          />
          {estado.erros?.email && <span role="alert">{estado.erros.email}</span>}
        </label>

        <label>
          Senha
          <input
            name="senha"
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
          />
          {estado.erros?.senha && <span role="alert">{estado.erros.senha}</span>}
        </label>

        <label>
          Confirmar senha
          <input
            name="confirmacaoSenha"
            type="password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
          />
          {/* feedback de UX no cliente */}
          {senhasDiferem && <span role="alert">As senhas não coincidem.</span>}
          {estado.erros?.confirmacaoSenha && (
            <span role="alert">{estado.erros.confirmacaoSenha}</span>
          )}
        </label>

        <label>
          <input name="termos" type="checkbox" required />
          {/* TODO: apontar para a política de privacidade real quando existir */}
          Li e aceito a <a href="#">política de privacidade</a>.
          {estado.erros?.termos && <span role="alert">{estado.erros.termos}</span>}
        </label>

        <button
          type="submit"
          disabled={pendente}
          style={{ width: "100%", minHeight: 44 }}
        >
          {pendente ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
