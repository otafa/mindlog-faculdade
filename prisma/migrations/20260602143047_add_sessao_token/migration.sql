/*
  Warnings:

  - Added the required column `token` to the `Sessao` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sessao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sessao" ("criadoEm", "expiraEm", "id", "usuarioId") SELECT "criadoEm", "expiraEm", "id", "usuarioId" FROM "Sessao";
DROP TABLE "Sessao";
ALTER TABLE "new_Sessao" RENAME TO "Sessao";
CREATE UNIQUE INDEX "Sessao_token_key" ON "Sessao"("token");
CREATE INDEX "Sessao_usuarioId_idx" ON "Sessao"("usuarioId");
CREATE INDEX "Sessao_expiraEm_idx" ON "Sessao"("expiraEm");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
