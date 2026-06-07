-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntradaDiarioTag" (
    "entradaDiarioId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("entradaDiarioId", "tagId"),
    CONSTRAINT "EntradaDiarioTag_entradaDiarioId_fkey" FOREIGN KEY ("entradaDiarioId") REFERENCES "EntradaDiario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntradaDiarioTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Tag_usuarioId_idx" ON "Tag"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_usuarioId_nome_key" ON "Tag"("usuarioId", "nome");

-- CreateIndex
CREATE INDEX "EntradaDiarioTag_tagId_idx" ON "EntradaDiarioTag"("tagId");
