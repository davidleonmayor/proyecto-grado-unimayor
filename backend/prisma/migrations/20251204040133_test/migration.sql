-- CreateTable
CREATE TABLE `EVENTO` (
    `id_evento` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_inicio` DATETIME(0) NOT NULL,
    `fecha_fin` DATETIME(0) NOT NULL,
    `hora_inicio` VARCHAR(10) NULL,
    `hora_fin` VARCHAR(10) NULL,
    `prioridad` VARCHAR(20) NOT NULL,
    `todo_el_dia` BOOLEAN NOT NULL DEFAULT false,
    `fecha_creacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `EVENTO_fecha_inicio_idx`(`fecha_inicio`),
    INDEX `EVENTO_prioridad_idx`(`prioridad`),
    PRIMARY KEY (`id_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
