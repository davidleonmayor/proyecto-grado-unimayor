-- AlterTable
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD COLUMN `personas_impactadas` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `estado` VARCHAR(50) NOT NULL DEFAULT 'Sin entregar';

-- CreateTable
CREATE TABLE `ANEXO_PROYECTO_SOCIAL` (
    `id_anexo` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `tipo_mime` VARCHAR(100) NOT NULL,
    `archivo` LONGBLOB NOT NULL,
    `fecha_subida` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ANEXO_PROYECTO_SOCIAL_id_proyecto_social_idx`(`id_proyecto_social`),
    PRIMARY KEY (`id_anexo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ANEXO_PROYECTO_SOCIAL` ADD CONSTRAINT `ANEXO_PROYECTO_SOCIAL_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;
