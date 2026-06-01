// Singleton do Prisma Client.
//
// Por que isto existe: em desenvolvimento, o hot reload do Next.js reavalia os
// módulos a cada mudança. Se instanciássemos `new PrismaClient()` diretamente,
// cada reload criaria uma nova instância — e cada instância abre seu próprio pool
// de conexões com o banco. Em poucos minutos isso esgota as conexões disponíveis
// ("too many connections"). Para evitar, guardamos a instância em globalThis, que
// sobrevive ao hot reload, e reutilizamos sempre a mesma.
//
// Em produção não há hot reload, então instanciamos normalmente uma única vez.
// Padrão recomendado pela documentação oficial do Prisma para Next.js.
//
// Nota Prisma 7: o client gerado exige um driver adapter. Para SQLite usamos
// @prisma/adapter-better-sqlite3, que recebe a connection string (DATABASE_URL).

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL não definida — configure o .env (veja .env.example).");
}

const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: PrismaClient;
};

// Export nomeado `prisma`: importe com `import { prisma } from "@/lib/db"`.
export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
