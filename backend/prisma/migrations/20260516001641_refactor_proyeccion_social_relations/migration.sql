/*
  Warnings:

  - You are about to drop the column `duracion_meses` on the `PROYECTO_PROYECCION_SOCIAL` table. All the data in the column will be lost.
  - You are about to drop the column `linea_accion` on the `PROYECTO_PROYECCION_SOCIAL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` DROP COLUMN `duracion_meses`,
    DROP COLUMN `linea_accion`,
    ADD COLUMN `duracion` VARCHAR(100) NULL,
    ADD COLUMN `id_asesor` VARCHAR(191) NULL,
    ADD COLUMN `id_facultad` VARCHAR(191) NULL,
    ADD COLUMN `lugar_y_tiempo_ejecucion` TEXT NULL;

-- CreateTable
CREATE TABLE `LINEA_ACCION_PROYECCION_SOCIAL` (
    `id_linea` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `nombre_linea` VARCHAR(200) NOT NULL,

    INDEX `LINEA_ACCION_PROYECCION_SOCIAL_id_proyecto_social_idx`(`id_proyecto_social`),
    PRIMARY KEY (`id_linea`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROPONENTE_PROYECCION_SOCIAL` (
    `id_proponente` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `id_persona` VARCHAR(191) NOT NULL,

    INDEX `PROPONENTE_PROYECCION_SOCIAL_id_proyecto_social_idx`(`id_proyecto_social`),
    INDEX `PROPONENTE_PROYECCION_SOCIAL_id_persona_idx`(`id_persona`),
    PRIMARY KEY (`id_proponente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PROYECTO_PROYECCION_SOCIAL_id_facultad_idx` ON `PROYECTO_PROYECCION_SOCIAL`(`id_facultad`);

-- CreateIndex
CREATE INDEX `PROYECTO_PROYECCION_SOCIAL_id_asesor_idx` ON `PROYECTO_PROYECCION_SOCIAL`(`id_asesor`);

-- AddForeignKey
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD CONSTRAINT `PROYECTO_PROYECCION_SOCIAL_id_facultad_fkey` FOREIGN KEY (`id_facultad`) REFERENCES `FACULTAD`(`id_facultad`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD CONSTRAINT `PROYECTO_PROYECCION_SOCIAL_id_asesor_fkey` FOREIGN KEY (`id_asesor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LINEA_ACCION_PROYECCION_SOCIAL` ADD CONSTRAINT `LINEA_ACCION_PROYECCION_SOCIAL_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROPONENTE_PROYECCION_SOCIAL` ADD CONSTRAINT `PROPONENTE_PROYECCION_SOCIAL_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROPONENTE_PROYECCION_SOCIAL` ADD CONSTRAINT `PROPONENTE_PROYECCION_SOCIAL_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;
