-- CreateTable
CREATE TABLE `PROYECTO_PROYECCION_SOCIAL` (
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipo_mime` VARCHAR(100) NOT NULL,
    `archivo` LONGBLOB NOT NULL,
    `id_persona_registra` VARCHAR(191) NULL,

    INDEX `PROYECTO_PROYECCION_SOCIAL_id_persona_registra_idx`(`id_persona_registra`),
    INDEX `PROYECTO_PROYECCION_SOCIAL_fecha_registro_idx`(`fecha_registro`),
    PRIMARY KEY (`id_proyecto_social`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD CONSTRAINT `PROYECTO_PROYECCION_SOCIAL_id_persona_registra_fkey` FOREIGN KEY (`id_persona_registra`) REFERENCES `PERSONA`(`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE;
