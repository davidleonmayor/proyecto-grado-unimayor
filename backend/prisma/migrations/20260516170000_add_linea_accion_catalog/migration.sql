-- Reset any existing rows in the join table — they used the legacy free-text
-- `nombre_linea`. Going forward each row stores `id_linea_accion` referencing
-- the new master catalog.
TRUNCATE TABLE `LINEA_ACCION_PROYECCION_SOCIAL`;

-- CreateTable
CREATE TABLE `LINEA_ACCION` (
    `id_linea_accion` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,

    UNIQUE INDEX `LINEA_ACCION_nombre_key`(`nombre`),
    PRIMARY KEY (`id_linea_accion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `LINEA_ACCION_PROYECCION_SOCIAL` DROP COLUMN `nombre_linea`,
    ADD COLUMN `id_linea_accion` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `LINEA_ACCION_PROYECCION_SOCIAL_id_linea_accion_idx` ON `LINEA_ACCION_PROYECCION_SOCIAL`(`id_linea_accion`);

-- CreateIndex
CREATE UNIQUE INDEX `LINEA_ACCION_PROYECCION_SOCIAL_id_proyecto_social_id_linea_a_key` ON `LINEA_ACCION_PROYECCION_SOCIAL`(`id_proyecto_social`, `id_linea_accion`);

-- AddForeignKey
ALTER TABLE `LINEA_ACCION_PROYECCION_SOCIAL` ADD CONSTRAINT `LINEA_ACCION_PROYECCION_SOCIAL_id_linea_accion_fkey` FOREIGN KEY (`id_linea_accion`) REFERENCES `LINEA_ACCION`(`id_linea_accion`) ON DELETE RESTRICT ON UPDATE CASCADE;
