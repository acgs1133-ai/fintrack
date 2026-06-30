-- CreateEnum
CREATE TYPE "Essencialidade" AS ENUM ('NECESSIDADE', 'DESEJO');

-- AlterTable
ALTER TABLE "Transacao" ADD COLUMN     "essencial" "Essencialidade";

-- CreateTable
CREATE TABLE "KeywordCategoria" (
    "id" TEXT NOT NULL,
    "palavra" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "usos" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recorrencia" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaDeposito" (
    "id" TEXT NOT NULL,
    "metaId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaDeposito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Divisao" (
    "id" TEXT NOT NULL,
    "transacaoId" TEXT NOT NULL,
    "numPessoas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Divisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" TEXT NOT NULL,
    "divisaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "quitado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeywordCategoria_palavra_key" ON "KeywordCategoria"("palavra");

-- CreateIndex
CREATE UNIQUE INDEX "Recorrencia_chave_key" ON "Recorrencia"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "Divisao_transacaoId_key" ON "Divisao"("transacaoId");

-- AddForeignKey
ALTER TABLE "KeywordCategoria" ADD CONSTRAINT "KeywordCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaDeposito" ADD CONSTRAINT "MetaDeposito_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divisao" ADD CONSTRAINT "Divisao_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "Transacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participante" ADD CONSTRAINT "Participante_divisaoId_fkey" FOREIGN KEY ("divisaoId") REFERENCES "Divisao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
