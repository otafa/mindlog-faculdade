// Criptografia em repouso para campos sensíveis (LGPD).
//
// Usada nos campos marcados "🔒 cripto" no schema: RegistroHumor.nota,
// EntradaDiario.conteudo, MensagemChat.conteudo. O texto é cifrado pela aplicação
// ANTES de gravar no banco e decifrado ao ler — no banco fica só o texto cifrado.
//
// Algoritmo: AES-256-GCM (confidencialidade + autenticidade/integridade via tag).
// Chave: ENCRYPTION_KEY (32 bytes em base64), em variável de ambiente, nunca commitada.
// Formato armazenado: base64( iv(12) | authTag(16) | ciphertext ).

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITMO = "aes-256-gcm";
const IV_LEN = 12; // recomendado para GCM
const TAG_LEN = 16;

function obterChave(): Buffer {
  const bruta = process.env.ENCRYPTION_KEY;
  if (!bruta) {
    throw new Error(
      "ENCRYPTION_KEY não definida — configure o .env (veja .env.example).",
    );
  }
  const chave = Buffer.from(bruta, "base64");
  if (chave.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY inválida: precisa ser 32 bytes (base64 de 32 bytes).",
    );
  }
  return chave;
}

/** Cifra um texto puro e devolve o payload em base64 (iv + tag + ciphertext). */
export function criptografar(textoPuro: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITMO, obterChave(), iv);
  const cifrado = Buffer.concat([
    cipher.update(textoPuro, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, cifrado]).toString("base64");
}

/** Decifra um payload gerado por criptografar(). Lança se a tag não conferir (adulteração). */
export function descriptografar(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const cifrado = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGORITMO, obterChave(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString(
    "utf8",
  );
}
