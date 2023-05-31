/*
  Warnings:

  - Added the required column `organiser_email` to the `Reviewer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reviewer" ADD COLUMN     "organiser_email" TEXT NOT NULL;
