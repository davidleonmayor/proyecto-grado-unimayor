-- AlterTable
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD COLUMN `bibliografia` TEXT NULL,
    ADD COLUMN `caracterizacion_poblacion` TEXT NULL,
    ADD COLUMN `ciudad_ejecucion` VARCHAR(100) NULL,
    ADD COLUMN `departamento_ejecucion` VARCHAR(100) NULL,
    ADD COLUMN `duracion_meses` INTEGER NULL,
    ADD COLUMN `id_programa` VARCHAR(191) NULL,
    ADD COLUMN `identificacion_problematica` TEXT NULL,
    ADD COLUMN `linea_accion` VARCHAR(200) NULL,
    ADD COLUMN `metodologia` TEXT NULL,
    ADD COLUMN `objetivo_general` TEXT NULL,
    ADD COLUMN `objetivos_especificos` TEXT NULL,
    ADD COLUMN `palabras_clave` VARCHAR(500) NULL,
    ADD COLUMN `propuesta_solucion` TEXT NULL,
    ADD COLUMN `resultados_esperados` TEXT NULL,
    ADD COLUMN `semestre` VARCHAR(50) NULL,
    ADD COLUMN `total_presupuesto` DECIMAL(15, 2) NULL;

-- CreateTable
CREATE TABLE `PLAN_ACCION_PROYECTO` (
    `id_plan` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `objetivo_especifico` TEXT NULL,
    `actividades` TEXT NULL,
    `duracion` VARCHAR(100) NULL,
    `responsables` VARCHAR(500) NULL,
    `meta` TEXT NULL,
    `indicador` TEXT NULL,

    INDEX `PLAN_ACCION_PROYECTO_id_proyecto_social_idx`(`id_proyecto_social`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PRESUPUESTO_EQUIPO_HUMANO` (
    `id_equipo_humano` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(200) NULL,
    `cargo` VARCHAR(150) NULL,
    `funcion` TEXT NULL,
    `tipo_vinculacion` VARCHAR(100) NULL,
    `salario` DECIMAL(15, 2) NULL,
    `total` DECIMAL(15, 2) NULL,

    INDEX `PRESUPUESTO_EQUIPO_HUMANO_id_proyecto_social_idx`(`id_proyecto_social`),
    PRIMARY KEY (`id_equipo_humano`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PRESUPUESTO_RECURSOS` (
    `id_recurso` VARCHAR(191) NOT NULL,
    `id_proyecto_social` VARCHAR(191) NOT NULL,
    `tipo_recurso` VARCHAR(100) NULL,
    `descripcion_equipo` TEXT NULL,
    `valor_unitario` DECIMAL(15, 2) NULL,
    `cantidad` INTEGER NULL,
    `valor_total` DECIMAL(15, 2) NULL,

    INDEX `PRESUPUESTO_RECURSOS_id_proyecto_social_idx`(`id_proyecto_social`),
    PRIMARY KEY (`id_recurso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PROYECTO_PROYECCION_SOCIAL_id_programa_idx` ON `PROYECTO_PROYECCION_SOCIAL`(`id_programa`);

-- AddForeignKey
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD CONSTRAINT `PROYECTO_PROYECCION_SOCIAL_id_programa_fkey` FOREIGN KEY (`id_programa`) REFERENCES `PROGRAMA_ACADEMICO`(`id_programa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PLAN_ACCION_PROYECTO` ADD CONSTRAINT `PLAN_ACCION_PROYECTO_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PRESUPUESTO_EQUIPO_HUMANO` ADD CONSTRAINT `PRESUPUESTO_EQUIPO_HUMANO_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PRESUPUESTO_RECURSOS` ADD CONSTRAINT `PRESUPUESTO_RECURSOS_id_proyecto_social_fkey` FOREIGN KEY (`id_proyecto_social`) REFERENCES `PROYECTO_PROYECCION_SOCIAL`(`id_proyecto_social`) ON DELETE CASCADE ON UPDATE CASCADE;
