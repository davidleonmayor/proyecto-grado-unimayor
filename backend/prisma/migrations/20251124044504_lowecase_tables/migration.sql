/*
  Warnings:

  - Made the column `numero_celular` on table `PERSONA` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `PERSONA` MODIFY `numero_celular` VARCHAR(20) NOT NULL;
