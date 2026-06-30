-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('RECEITA', 'DESPESA', 'AMBOS');

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "tipoCat" "TipoCategoria" NOT NULL DEFAULT 'DESPESA';
