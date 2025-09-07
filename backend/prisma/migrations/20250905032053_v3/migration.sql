/*
  Warnings:

  - You are about to drop the column `PORC_CREDITOS_APROBADOS` on the `ESTUDIANTE_PROGRAMA` table. All the data in the column will be lost.
  - The primary key for the `PERSONA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AREA_ESPECIALIZACION` on the `PERSONA` table. All the data in the column will be lost.
  - The primary key for the `PRACTICA_PROFESIONAL` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CARGO_SUPERVISOR` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `ESTADO_PRACTICA` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_FIN` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_INICIO` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_SUPERVISOR` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_CONSTANCIA_ARL` on the `PRACTICA_PROFESIONAL` table. All the data in the column will be lost.
  - You are about to drop the column `DETALLE` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ESTADO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_INICIO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the `EVALUACION_TG` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ROL_PERSONA_TG` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SUSTENTACION` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `IdPersona` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PRACTICA_PROFESIONAL` to the `PRACTICA_PROFESIONAL` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ESTUDIANTE_PROGRAMA` DROP FOREIGN KEY `ESTUDIANTE_PROGRAMA_CARNET_fkey`;

-- DropForeignKey
ALTER TABLE `EVALUACION_TG` DROP FOREIGN KEY `EVALUACION_TG_CARNET_EVALUADOR_fkey`;

-- DropForeignKey
ALTER TABLE `EVALUACION_TG` DROP FOREIGN KEY `EVALUACION_TG_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `PRACTICA_PROFESIONAL` DROP FOREIGN KEY `PRACTICA_PROFESIONAL_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `ROL_PERSONA_TG` DROP FOREIGN KEY `ROL_PERSONA_TG_CARNET_fkey`;

-- DropForeignKey
ALTER TABLE `ROL_PERSONA_TG` DROP FOREIGN KEY `ROL_PERSONA_TG_ID_TIPO_ROL_fkey`;

-- DropForeignKey
ALTER TABLE `ROL_PERSONA_TG` DROP FOREIGN KEY `ROL_PERSONA_TG_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_CARNET_ACTOR_fkey`;

-- DropForeignKey
ALTER TABLE `SUSTENTACION` DROP FOREIGN KEY `SUSTENTACION_ID_TRABAJO_GRADO_fkey`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_CARNET_ACTOR_fkey` ON `SEGUIMIENTO_TG`;

-- AlterTable
ALTER TABLE `ESTUDIANTE_PROGRAMA` DROP COLUMN `PORC_CREDITOS_APROBADOS`;

-- AlterTable
ALTER TABLE `PERSONA` DROP PRIMARY KEY,
    DROP COLUMN `AREA_ESPECIALIZACION`,
    ADD COLUMN `IdPersona` VARCHAR(191) NOT NULL,
    MODIFY `CARNET` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`IdPersona`);

-- AlterTable
ALTER TABLE `PRACTICA_PROFESIONAL` DROP PRIMARY KEY,
    DROP COLUMN `CARGO_SUPERVISOR`,
    DROP COLUMN `ESTADO_PRACTICA`,
    DROP COLUMN `FECHA_FIN`,
    DROP COLUMN `FECHA_INICIO`,
    DROP COLUMN `NOMBRE_SUPERVISOR`,
    DROP COLUMN `NUMERO_CONSTANCIA_ARL`,
    ADD COLUMN `ID_PRACTICA_PROFESIONAL` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `ID_TRABAJO_GRADO` INTEGER NULL,
    ADD PRIMARY KEY (`ID_PRACTICA_PROFESIONAL`);

-- AlterTable
ALTER TABLE `SEGUIMIENTO_TG` DROP COLUMN `DETALLE`,
    ADD COLUMN `CALIFICACION_FINAL` INTEGER NULL,
    ADD COLUMN `CONCEPTO` VARCHAR(191) NULL,
    ADD COLUMN `DISTINCION` VARCHAR(191) NULL,
    ADD COLUMN `FECHA_RESOLUCION` DATETIME(3) NULL,
    ADD COLUMN `FECHA_SUSTENTACION` DATETIME(3) NULL,
    ADD COLUMN `LUGAR` VARCHAR(191) NULL,
    ADD COLUMN `NUMERO_RESOLUCION` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TRABAJO_GRADO` DROP COLUMN `ESTADO`,
    DROP COLUMN `FECHA_INICIO`,
    ADD COLUMN `FECHA_REGISTRO` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `RESUMEN` TEXT NULL;

-- DropTable
DROP TABLE `EVALUACION_TG`;

-- DropTable
DROP TABLE `ROL_PERSONA_TG`;

-- DropTable
DROP TABLE `SUSTENTACION`;

-- CreateTable
CREATE TABLE `ACTORES` (
    `ID_ACTORES` INTEGER NOT NULL AUTO_INCREMENT,
    `IdEstudiantePrograma` VARCHAR(191) NOT NULL,
    `ID_TRABAJO_GRADO` INTEGER NOT NULL,
    `ID_TIPO_ROL` INTEGER NOT NULL,
    `FECHA_ASIGNACION` DATETIME(3) NOT NULL,
    `FECHA_RETIRO` DATETIME(3) NULL,
    `ESTADO` VARCHAR(191) NOT NULL,
    `OBSERVACIONES` VARCHAR(191) NULL,

    PRIMARY KEY (`ID_ACTORES`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ESTUDIANTE_PROGRAMA` ADD CONSTRAINT `ESTUDIANTE_PROGRAMA_CARNET_fkey` FOREIGN KEY (`CARNET`) REFERENCES `PERSONA`(`IdPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_IdEstudiantePrograma_fkey` FOREIGN KEY (`IdEstudiantePrograma`) REFERENCES `PERSONA`(`IdPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_ID_TRABAJO_GRADO_fkey` FOREIGN KEY (`ID_TRABAJO_GRADO`) REFERENCES `TRABAJO_GRADO`(`ID_TRABAJO_GRADO`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_ID_TIPO_ROL_fkey` FOREIGN KEY (`ID_TIPO_ROL`) REFERENCES `TIPO_ROL`(`ID_TIPO_ROL`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_CARNET_ACTOR_fkey` FOREIGN KEY (`CARNET_ACTOR`) REFERENCES `PERSONA`(`IdPersona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PRACTICA_PROFESIONAL` ADD CONSTRAINT `PRACTICA_PROFESIONAL_ID_TRABAJO_GRADO_fkey` FOREIGN KEY (`ID_TRABAJO_GRADO`) REFERENCES `TRABAJO_GRADO`(`ID_TRABAJO_GRADO`) ON DELETE SET NULL ON UPDATE CASCADE;
