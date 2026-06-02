"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { hashSenha } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { criarSessao } from "@/lib/session";

// Política de senha (OWASP): comprimento mínimo e máximo, sem regras de composição.
const SENHA_MIN = 8;
const SENHA_MAX = 128;

// Formato de e-mail: validação pragmática (não tenta cobrir toda a RFC 5322).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ErrosCadastro = {
  nome?: string;
  email?: string;
  senha?: string;
  confirmacaoSenha?: string;
  termos?: string;
};

export type EstadoCadastro = {
  erros?: ErrosCadastro;
  // valores devolvidos para repreencher os campos após erro (nunca a senha).
  valores?: { nome: string; email: string };
};

export async function cadastrar(
  _estadoAnterior: EstadoCadastro,
  formData: FormData,
): Promise<EstadoCadastro> {
  const nome = (formData.get("nome") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const senha = (formData.get("senha") as string | null) ?? "";
  const confirmacaoSenha = (formData.get("confirmacaoSenha") as string | null) ?? "";
  const termos = formData.get("termos") != null; // checkbox presente = aceito

  // Valores para repreencher o formulário em caso de erro (senha nunca volta).
  const valores = { nome, email };

  // --- Validação no servidor (a que vale) ---
  const erros: ErrosCadastro = {};
  if (nome.length === 0) erros.nome = "Informe seu nome.";
  if (!EMAIL_REGEX.test(email)) erros.email = "Informe um e-mail válido.";
  if (senha.length < SENHA_MIN || senha.length > SENHA_MAX) {
    erros.senha = `A senha deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`;
  }
  if (confirmacaoSenha !== senha) {
    erros.confirmacaoSenha = "As senhas não coincidem.";
  }
  if (!termos) erros.termos = "É necessário aceitar os termos.";

  if (Object.keys(erros).length > 0) {
    return { erros, valores };
  }

  // --- Criação do usuário ---
  const senhaHash = await hashSenha(senha);

  let usuarioId: string;
  try {
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        consentimentoEm: new Date(), // timestamp do aceite dos termos (LGPD)
        // planoId fica no default "semente"
      },
      select: { id: true },
    });
    usuarioId = usuario.id;
  } catch (e) {
    // P2002 = violação de unique (e-mail já cadastrado).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { erros: { email: "Este e-mail já está cadastrado." }, valores };
    }
    throw e; // erro inesperado: deixa propagar
  }

  // Login automático: cria a sessão e redireciona.
  await criarSessao(usuarioId);
  redirect("/"); // dashboard real vem na Fase 3
}
