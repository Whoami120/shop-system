-- AlterEnum
ALTER TYPE "MoveType" ADD VALUE 'REFUND';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "refunded" BOOLEAN NOT NULL DEFAULT false;
