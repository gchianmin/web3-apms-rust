/*
  Warnings:

  - The primary key for the `Reviewer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Reviewer" DROP CONSTRAINT "Reviewer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Reviewer_id_seq";
