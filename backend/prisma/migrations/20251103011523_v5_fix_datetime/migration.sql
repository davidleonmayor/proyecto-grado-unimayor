/*
  Warnings:

  - The primary key for the `ACTORES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_ACTORES` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `IdEstudiantePrograma` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to alter the column `FECHA_RETIRO` on the `ACTORES` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `ESTADO` on the `ACTORES` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to drop the column `EMAIL_CONTACTO` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to alter the column `NIT_EMPRESA` on the `EMPRESA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `TELEFONO` on the `EMPRESA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `ESTADO` on the `EMPRESA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `NOMBRE_ESTADO` on the `ESTADO_TG` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `CODIGO_FACULTAD` on the `FACULTAD` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `NIVEL_FORMACION` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_NIVEL_FORMACION` on the `NIVEL_FORMACION` table. All the data in the column will be lost.
  - You are about to alter the column `NOMBRE_NIVEL` on the `NIVEL_FORMACION` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to drop the column `DESCRIPCION_OPCION` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PROGRAMA_NIVEL` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to alter the column `NOMBRE_OPCION_GRADO` on the `OPCION_GRADO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `ESTADO` on the `OPCION_GRADO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The primary key for the `PERSONA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CARNET` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `EMAIL_INSTITUCIONAL` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `IdPersona` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `TELEFONO` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_DOC_IDENTIDAD` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_VINCULACION` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to alter the column `NOMBRES` on the `PERSONA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `APELLIDOS` on the `PERSONA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `NUM_DOC_IDENTIDAD` on the `PERSONA` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `FECHA_REGISTRO` on the `PERSONA` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - The primary key for the `PROGRAMA_ACADEMICO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CODIGO_SNIES` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PROGRAMA_ACADEMICO` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to alter the column `ESTADO` on the `PROGRAMA_ACADEMICO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to drop the column `CALIFICACION_FINAL` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `CARNET_ACTOR` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `CONCEPTO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `DESCRIPCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_RESOLUCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_SUSTENTACION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `LUGAR` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `RUTA_ARCHIVO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_ACCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to alter the column `FECHA_REGISTRO` on the `SEGUIMIENTO_TG` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `NUMERO_OFICIO` on the `SEGUIMIENTO_TG` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `TIPO_DOCUMENTO` on the `SEGUIMIENTO_TG` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `DISTINCION` on the `SEGUIMIENTO_TG` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `NUMERO_RESOLUCION` on the `SEGUIMIENTO_TG` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `TIPO_ROL` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_TIPO_ROL` on the `TIPO_ROL` table. All the data in the column will be lost.
  - You are about to alter the column `NOMBRE_ROL` on the `TIPO_ROL` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to drop the column `FECHA_FIN_ESTIMADA` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to alter the column `FECHA_REGISTRO` on the `TRABAJO_GRADO` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to drop the `ESTUDIANTE_PROGRAMA` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PRACTICA_PROFESIONAL` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PROGRAMA_NIVEL` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[CORREO_ELECTRONICO]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[TOKEN]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ID_ACTOR` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PERSONA` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_NIVEL` to the `NIVEL_FORMACION` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CORREO_ELECTRONICO` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PERSONA` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_TIPO_DOC_IDENTIDAD` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_NIVEL_FORMACION` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PROGRAMA` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_ACCION` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_ACTOR` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_ROL` to the `TIPO_ROL` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FECHA_INICIO` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_PROGRAMA_ACADEMICO` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_ID_TIPO_ROL_fkey`;

-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_IdEstudiantePrograma_fkey`;

-- DropForeignKey
ALTER TABLE `ESTUDIANTE_PROGRAMA` DROP FOREIGN KEY `ESTUDIANTE_PROGRAMA_CARNET_fkey`;

-- DropForeignKey
ALTER TABLE `ESTUDIANTE_PROGRAMA` DROP FOREIGN KEY `ESTUDIANTE_PROGRAMA_ID_PROGRAMA_ACADEMICO_fkey`;

-- DropForeignKey
ALTER TABLE `OPCION_GRADO` DROP FOREIGN KEY `OPCION_GRADO_ID_PROGRAMA_NIVEL_fkey`;

-- DropForeignKey
ALTER TABLE `PRACTICA_PROFESIONAL` DROP FOREIGN KEY `PRACTICA_PROFESIONAL_ID_EMPRESA_fkey`;

-- DropForeignKey
ALTER TABLE `PRACTICA_PROFESIONAL` DROP FOREIGN KEY `PRACTICA_PROFESIONAL_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_NIVEL` DROP FOREIGN KEY `PROGRAMA_NIVEL_ID_NIVEL_FORMACION_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_NIVEL` DROP FOREIGN KEY `PROGRAMA_NIVEL_ID_PROGRAMA_ACADEMICO_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_CARNET_ACTOR_fkey`;

-- DropIndex
DROP INDEX `ACTORES_IdEstudiantePrograma_fkey` ON `ACTORES`;

-- DropIndex
DROP INDEX `EMPRESA_NIT_EMPRESA_key` ON `EMPRESA`;

-- DropIndex
DROP INDEX `FACULTAD_CODIGO_FACULTAD_key` ON `FACULTAD`;

-- DropIndex
DROP INDEX `OPCION_GRADO_ID_PROGRAMA_NIVEL_fkey` ON `OPCION_GRADO`;

-- DropIndex
DROP INDEX `PERSONA_EMAIL_INSTITUCIONAL_key` ON `PERSONA`;

-- DropIndex
DROP INDEX `PROGRAMA_ACADEMICO_CODIGO_SNIES_key` ON `PROGRAMA_ACADEMICO`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_CARNET_ACTOR_fkey` ON `SEGUIMIENTO_TG`;

-- AlterTable
ALTER TABLE `ACTORES` DROP PRIMARY KEY,
    DROP COLUMN `ID_ACTORES`,
    DROP COLUMN `IdEstudiantePrograma`,
    ADD COLUMN `ID_ACTOR` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `ID_PERSONA` INTEGER NOT NULL,
    MODIFY `FECHA_ASIGNACION` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `FECHA_RETIRO` DATETIME(0) NULL,
    MODIFY `ESTADO` VARCHAR(20) NOT NULL,
    MODIFY `OBSERVACIONES` TEXT NULL,
    ADD PRIMARY KEY (`ID_ACTOR`);

-- AlterTable
ALTER TABLE `EMPRESA` DROP COLUMN `EMAIL_CONTACTO`,
    ADD COLUMN `EMAIL` VARCHAR(100) NULL,
    MODIFY `NIT_EMPRESA` VARCHAR(50) NOT NULL,
    MODIFY `NOMBRE_EMPRESA` VARCHAR(200) NOT NULL,
    MODIFY `DIRECCION` VARCHAR(200) NULL,
    MODIFY `TELEFONO` VARCHAR(20) NULL,
    MODIFY `ESTADO` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `ESTADO_TG` MODIFY `NOMBRE_ESTADO` VARCHAR(100) NOT NULL,
    MODIFY `DESCRIPCION` TEXT NULL;

-- AlterTable
ALTER TABLE `FACULTAD` MODIFY `NOMBRE_FACULTAD` VARCHAR(200) NOT NULL,
    MODIFY `CODIGO_FACULTAD` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `NIVEL_FORMACION` DROP PRIMARY KEY,
    DROP COLUMN `ID_NIVEL_FORMACION`,
    ADD COLUMN `ID_NIVEL` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `NOMBRE_NIVEL` VARCHAR(100) NOT NULL,
    MODIFY `DESCRIPCION` TEXT NULL,
    ADD PRIMARY KEY (`ID_NIVEL`);

-- AlterTable
ALTER TABLE `OPCION_GRADO` DROP COLUMN `DESCRIPCION_OPCION`,
    DROP COLUMN `ID_PROGRAMA_NIVEL`,
    ADD COLUMN `DESCRIPCION` TEXT NULL,
    ADD COLUMN `FECHA_CREACION` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `TIPO_MODALIDAD` VARCHAR(50) NULL,
    MODIFY `NOMBRE_OPCION_GRADO` VARCHAR(100) NOT NULL,
    MODIFY `ESTADO` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `PERSONA` DROP PRIMARY KEY,
    DROP COLUMN `CARNET`,
    DROP COLUMN `EMAIL_INSTITUCIONAL`,
    DROP COLUMN `IdPersona`,
    DROP COLUMN `TELEFONO`,
    DROP COLUMN `TIPO_DOC_IDENTIDAD`,
    DROP COLUMN `TIPO_VINCULACION`,
    ADD COLUMN `BLOQUEADO_HASTA` DATETIME(0) NULL,
    ADD COLUMN `CONFIRMED` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `CORREO_ELECTRONICO` VARCHAR(100) NOT NULL,
    ADD COLUMN `ID_PERSONA` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `ID_TIPO_DOC_IDENTIDAD` INTEGER NOT NULL,
    ADD COLUMN `INTENTOS_FALLIDOS` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `NUMERO_CELULAR` VARCHAR(20) NULL,
    ADD COLUMN `PASSWORD` VARCHAR(60) NULL,
    ADD COLUMN `TOKEN` VARCHAR(6) NULL,
    ADD COLUMN `ULTIMO_ACCESO` DATETIME(0) NULL,
    MODIFY `NOMBRES` VARCHAR(100) NOT NULL,
    MODIFY `APELLIDOS` VARCHAR(100) NOT NULL,
    MODIFY `NUM_DOC_IDENTIDAD` VARCHAR(50) NOT NULL,
    MODIFY `FECHA_REGISTRO` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD PRIMARY KEY (`ID_PERSONA`);

-- AlterTable
ALTER TABLE `PROGRAMA_ACADEMICO` DROP PRIMARY KEY,
    DROP COLUMN `CODIGO_SNIES`,
    DROP COLUMN `ID_PROGRAMA_ACADEMICO`,
    ADD COLUMN `ID_NIVEL_FORMACION` INTEGER NOT NULL,
    ADD COLUMN `ID_PROGRAMA` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `NOMBRE_PROGRAMA` VARCHAR(200) NOT NULL,
    MODIFY `ESTADO` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`ID_PROGRAMA`);

-- AlterTable
ALTER TABLE `SEGUIMIENTO_TG` DROP COLUMN `CALIFICACION_FINAL`,
    DROP COLUMN `CARNET_ACTOR`,
    DROP COLUMN `CONCEPTO`,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `FECHA_RESOLUCION`,
    DROP COLUMN `FECHA_SUSTENTACION`,
    DROP COLUMN `LUGAR`,
    DROP COLUMN `RUTA_ARCHIVO`,
    DROP COLUMN `TIPO_ACCION`,
    ADD COLUMN `CALIFICACION` DECIMAL(3, 2) NULL,
    ADD COLUMN `FECHA` DATE NULL,
    ADD COLUMN `ID_ACCION` INTEGER NOT NULL,
    ADD COLUMN `ID_ACTOR` INTEGER NOT NULL,
    ADD COLUMN `RESUMEN` TEXT NULL,
    MODIFY `FECHA_REGISTRO` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `NUMERO_OFICIO` VARCHAR(50) NULL,
    MODIFY `FECHA_OFICIO` DATE NULL,
    MODIFY `NOMBRE_DOCUMENTO` VARCHAR(200) NULL,
    MODIFY `TIPO_DOCUMENTO` VARCHAR(50) NULL,
    MODIFY `DISTINCION` VARCHAR(100) NULL,
    MODIFY `NUMERO_RESOLUCION` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `TIPO_ROL` DROP PRIMARY KEY,
    DROP COLUMN `ID_TIPO_ROL`,
    ADD COLUMN `ACTIVO` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `FECHA_CREACION` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `ID_ROL` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `NOMBRE_ROL` VARCHAR(100) NOT NULL,
    MODIFY `DESCRIPCION` TEXT NULL,
    ADD PRIMARY KEY (`ID_ROL`);

-- AlterTable
ALTER TABLE `TRABAJO_GRADO` DROP COLUMN `FECHA_FIN_ESTIMADA`,
    ADD COLUMN `FECHA_FIN_ESTIMA` DATE NULL,
    ADD COLUMN `FECHA_INICIO` DATE NOT NULL,
    ADD COLUMN `ID_EMPRESA_PRACTICA` INTEGER NULL,
    ADD COLUMN `ID_PROGRAMA_ACADEMICO` INTEGER NOT NULL,
    MODIFY `TITULO_TRABAJO` VARCHAR(500) NOT NULL,
    MODIFY `FECHA_REGISTRO` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- DropTable
DROP TABLE `ESTUDIANTE_PROGRAMA`;

-- DropTable
DROP TABLE `PRACTICA_PROFESIONAL`;

-- DropTable
DROP TABLE `PROGRAMA_NIVEL`;

-- CreateTable
CREATE TABLE `TIPO_DOCUMENTO` (
    `ID_TIPO_DOCUMENTO` INTEGER NOT NULL AUTO_INCREMENT,
    `DOCUMENTO` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`ID_TIPO_DOCUMENTO`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opcion_grado_formacion` (
    `id_opcion_grado_formacion` INTEGER NOT NULL AUTO_INCREMENT,
    `ID_OPCION_GRADO` INTEGER NOT NULL,
    `ID_NIVEL_FORMACION` INTEGER NOT NULL,

    INDEX `opcion_grado_formacion_ID_OPCION_GRADO_idx`(`ID_OPCION_GRADO`),
    INDEX `opcion_grado_formacion_ID_NIVEL_FORMACION_idx`(`ID_NIVEL_FORMACION`),
    PRIMARY KEY (`id_opcion_grado_formacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accion_seg` (
    `ID_ACCION` INTEGER NOT NULL AUTO_INCREMENT,
    `TIPO_ACCION` VARCHAR(100) NOT NULL,
    `DESCRIPCION` TEXT NULL,

    PRIMARY KEY (`ID_ACCION`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DISTINCIONES` (
    `ID_DISTINCION` INTEGER NOT NULL AUTO_INCREMENT,
    `NOMBRE` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`ID_DISTINCION`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DISTINCION_TG` (
    `ID_DISTINCION_TG` INTEGER NOT NULL AUTO_INCREMENT,
    `CALIFICACION` DECIMAL(3, 2) NOT NULL,
    `FECHA` DATE NOT NULL,
    `NUMERO_RESOLUCION` VARCHAR(50) NOT NULL,
    `ID_DISTINCION` INTEGER NOT NULL,
    `ID_TRABAJO_GRADO` INTEGER NOT NULL,
    `ID_SEGUIMIENTO` INTEGER NOT NULL,

    INDEX `DISTINCION_TG_ID_DISTINCION_idx`(`ID_DISTINCION`),
    INDEX `DISTINCION_TG_ID_TRABAJO_GRADO_idx`(`ID_TRABAJO_GRADO`),
    INDEX `DISTINCION_TG_ID_SEGUIMIENTO_idx`(`ID_SEGUIMIENTO`),
    PRIMARY KEY (`ID_DISTINCION_TG`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ACTORES_ID_PERSONA_idx` ON `ACTORES`(`ID_PERSONA`);

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_CORREO_ELECTRONICO_key` ON `PERSONA`(`CORREO_ELECTRONICO`);

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_TOKEN_key` ON `PERSONA`(`TOKEN`);

-- CreateIndex
CREATE INDEX `PERSONA_ID_TIPO_DOC_IDENTIDAD_idx` ON `PERSONA`(`ID_TIPO_DOC_IDENTIDAD`);

-- CreateIndex
CREATE INDEX `PERSONA_CORREO_ELECTRONICO_idx` ON `PERSONA`(`CORREO_ELECTRONICO`);

-- CreateIndex
CREATE INDEX `PERSONA_TOKEN_idx` ON `PERSONA`(`TOKEN`);

-- CreateIndex
CREATE INDEX `PROGRAMA_ACADEMICO_ID_NIVEL_FORMACION_idx` ON `PROGRAMA_ACADEMICO`(`ID_NIVEL_FORMACION`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_ID_ACTOR_idx` ON `SEGUIMIENTO_TG`(`ID_ACTOR`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_ID_ACCION_idx` ON `SEGUIMIENTO_TG`(`ID_ACCION`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_ID_EMPRESA_PRACTICA_idx` ON `TRABAJO_GRADO`(`ID_EMPRESA_PRACTICA`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_ID_PROGRAMA_ACADEMICO_idx` ON `TRABAJO_GRADO`(`ID_PROGRAMA_ACADEMICO`);

-- AddForeignKey
ALTER TABLE `PERSONA` ADD CONSTRAINT `PERSONA_ID_TIPO_DOC_IDENTIDAD_fkey` FOREIGN KEY (`ID_TIPO_DOC_IDENTIDAD`) REFERENCES `TIPO_DOCUMENTO`(`ID_TIPO_DOCUMENTO`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` ADD CONSTRAINT `PROGRAMA_ACADEMICO_ID_NIVEL_FORMACION_fkey` FOREIGN KEY (`ID_NIVEL_FORMACION`) REFERENCES `NIVEL_FORMACION`(`ID_NIVEL`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opcion_grado_formacion` ADD CONSTRAINT `opcion_grado_formacion_ID_OPCION_GRADO_fkey` FOREIGN KEY (`ID_OPCION_GRADO`) REFERENCES `OPCION_GRADO`(`ID_OPCION_GRADO`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opcion_grado_formacion` ADD CONSTRAINT `opcion_grado_formacion_ID_NIVEL_FORMACION_fkey` FOREIGN KEY (`ID_NIVEL_FORMACION`) REFERENCES `NIVEL_FORMACION`(`ID_NIVEL`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_ID_EMPRESA_PRACTICA_fkey` FOREIGN KEY (`ID_EMPRESA_PRACTICA`) REFERENCES `EMPRESA`(`ID_EMPRESA`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_ID_PROGRAMA_ACADEMICO_fkey` FOREIGN KEY (`ID_PROGRAMA_ACADEMICO`) REFERENCES `PROGRAMA_ACADEMICO`(`ID_PROGRAMA`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_ID_PERSONA_fkey` FOREIGN KEY (`ID_PERSONA`) REFERENCES `PERSONA`(`ID_PERSONA`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_ID_TIPO_ROL_fkey` FOREIGN KEY (`ID_TIPO_ROL`) REFERENCES `TIPO_ROL`(`ID_ROL`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_ID_ACTOR_fkey` FOREIGN KEY (`ID_ACTOR`) REFERENCES `ACTORES`(`ID_ACTOR`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_ID_ACCION_fkey` FOREIGN KEY (`ID_ACCION`) REFERENCES `accion_seg`(`ID_ACCION`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_ID_DISTINCION_fkey` FOREIGN KEY (`ID_DISTINCION`) REFERENCES `DISTINCIONES`(`ID_DISTINCION`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_ID_TRABAJO_GRADO_fkey` FOREIGN KEY (`ID_TRABAJO_GRADO`) REFERENCES `TRABAJO_GRADO`(`ID_TRABAJO_GRADO`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_ID_SEGUIMIENTO_fkey` FOREIGN KEY (`ID_SEGUIMIENTO`) REFERENCES `SEGUIMIENTO_TG`(`ID_SEGUIMIENTO`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `ACTORES` RENAME INDEX `ACTORES_ID_TIPO_ROL_fkey` TO `ACTORES_ID_TIPO_ROL_idx`;

-- RenameIndex
ALTER TABLE `ACTORES` RENAME INDEX `ACTORES_ID_TRABAJO_GRADO_fkey` TO `ACTORES_ID_TRABAJO_GRADO_idx`;

-- RenameIndex
ALTER TABLE `PROGRAMA_ACADEMICO` RENAME INDEX `PROGRAMA_ACADEMICO_ID_FACULTAD_fkey` TO `PROGRAMA_ACADEMICO_ID_FACULTAD_idx`;

-- RenameIndex
ALTER TABLE `SEGUIMIENTO_TG` RENAME INDEX `SEGUIMIENTO_TG_ID_ESTADO_ANTERIOR_fkey` TO `SEGUIMIENTO_TG_ID_ESTADO_ANTERIOR_idx`;

-- RenameIndex
ALTER TABLE `SEGUIMIENTO_TG` RENAME INDEX `SEGUIMIENTO_TG_ID_ESTADO_NUEVO_fkey` TO `SEGUIMIENTO_TG_ID_ESTADO_NUEVO_idx`;

-- RenameIndex
ALTER TABLE `SEGUIMIENTO_TG` RENAME INDEX `SEGUIMIENTO_TG_ID_TRABAJO_GRADO_fkey` TO `SEGUIMIENTO_TG_ID_TRABAJO_GRADO_idx`;

-- RenameIndex
ALTER TABLE `TRABAJO_GRADO` RENAME INDEX `TRABAJO_GRADO_ID_ESTADO_ACTUAL_fkey` TO `TRABAJO_GRADO_ID_ESTADO_ACTUAL_idx`;

-- RenameIndex
ALTER TABLE `TRABAJO_GRADO` RENAME INDEX `TRABAJO_GRADO_ID_OPCION_GRADO_fkey` TO `TRABAJO_GRADO_ID_OPCION_GRADO_idx`;
