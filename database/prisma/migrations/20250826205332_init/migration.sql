/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Product`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `DL_ESTUDIANTE` (
    `id_estudiante` VARCHAR(191) NOT NULL,
    `id_programa_academico` INTEGER NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `tipo_doc_identidad` VARCHAR(191) NOT NULL,
    `num_doc_identidad` VARCHAR(191) NOT NULL,
    `email_institucional` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `porc_creditos_aprob` INTEGER NOT NULL,
    `estado_academico` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_estudiante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_PROGRAMA_ACADEMICO` (
    `id_programa_academico` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_programa` VARCHAR(191) NOT NULL,
    `nivel_formacion` VARCHAR(191) NOT NULL,
    `id_facultad` INTEGER NOT NULL,
    `codigo_snies` VARCHAR(191) NULL,

    PRIMARY KEY (`id_programa_academico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_FACULTAD` (
    `id_facultad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_facultad` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_facultad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_OPCION_GRADO` (
    `id_opcion_grado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_opcion_grado` VARCHAR(191) NOT NULL,
    `descripcion_opcion` VARCHAR(191) NULL,
    `tipo_programa_academico` VARCHAR(191) NOT NULL,
    `id_programa_academico` INTEGER NOT NULL,

    PRIMARY KEY (`id_opcion_grado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_TRABAJO_GRADO` (
    `id_trabajo_grado` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo_trabajo` VARCHAR(191) NOT NULL,
    `id_estudiante_principal` VARCHAR(191) NOT NULL,
    `id_opcion_grado` INTEGER NOT NULL,
    `id_estado_actual` INTEGER NOT NULL,
    `observaciones` TEXT NULL,

    PRIMARY KEY (`id_trabajo_grado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_EST_EST_TG` (
    `id_estudiante` VARCHAR(191) NOT NULL,
    `id_trabajo_grado` INTEGER NOT NULL,

    PRIMARY KEY (`id_estudiante`, `id_trabajo_grado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_ASIGNACION_ASESOR` (
    `id_asignacion_asesor` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trabajo_grado` INTEGER NOT NULL,
    `id_docente_asesor` VARCHAR(191) NOT NULL,
    `fecha_asignacion` DATE NOT NULL,
    `estado_asesoria` VARCHAR(191) NULL,

    PRIMARY KEY (`id_asignacion_asesor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_ASIGNACION_JURADO` (
    `id_asignacion_jurado` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trabajo_grado` INTEGER NOT NULL,
    `id_docente_jurado` VARCHAR(191) NOT NULL,
    `fecha_asignacion` DATE NOT NULL,
    `fecha_concepto` DATE NULL,
    `concepto_emitido` VARCHAR(191) NULL,

    PRIMARY KEY (`id_asignacion_jurado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_DOCENTE` (
    `id_docente` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tipo_vinculacion` VARCHAR(191) NOT NULL,
    `area_especializacion` VARCHAR(191) NOT NULL,
    `tipo_docente` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_docente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_HIST_ESTADO_TG` (
    `id_historial` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trabajo_grado` INTEGER NOT NULL,
    `id_estado_tg` INTEGER NOT NULL,
    `id_consejo_facultad` INTEGER NOT NULL,
    `fecha_cambio_estado` TIMESTAMP NOT NULL,
    `observacion` VARCHAR(191) NULL,
    `numero_oficio` VARCHAR(191) NULL,
    `fecha_oficio` DATE NULL,

    PRIMARY KEY (`id_historial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_ESTADO_TG` (
    `id_estado_tg` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_estado` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_estado_tg`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_CONSEJO_FACULTAD` (
    `id_consejo` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_consejo` VARCHAR(191) NOT NULL,
    `fecha_acta` DATE NOT NULL,
    `numero_acta` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_consejo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_EMPRESA` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nit_empresa` VARCHAR(191) NOT NULL,
    `nombre_empresa` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `email_contacto` VARCHAR(191) NULL,

    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_DET_PRACT_PROF` (
    `id_trabajo_grado` INTEGER NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    `nombre_jefe` VARCHAR(191) NOT NULL,
    `cargo_jefe` VARCHAR(191) NOT NULL,
    `constancia_arl` LONGBLOB NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,

    PRIMARY KEY (`id_trabajo_grado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_SUSTENTACION` (
    `id_sustentacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trabajo_grado` INTEGER NOT NULL,
    `fecha_sustentacion` DATE NOT NULL,
    `calificacion_final` INTEGER NOT NULL,
    `observaciones` TEXT NULL,
    `resolucion_meritorio` VARCHAR(191) NULL,
    `resolucion_laureado` VARCHAR(191) NULL,

    PRIMARY KEY (`id_sustentacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_DOC_ADJ_TRG` (
    `id_documento_adjunto` INTEGER NOT NULL AUTO_INCREMENT,
    `id_historial` INTEGER NOT NULL,
    `nombre_doc` VARCHAR(191) NOT NULL,
    `tipo_doc` VARCHAR(191) NOT NULL,
    `archivo_adjunto` LONGBLOB NOT NULL,
    `fecha_carga` TIMESTAMP NOT NULL,
    `descripcion_doc` VARCHAR(191) NULL,

    PRIMARY KEY (`id_documento_adjunto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DL_OFICIO` (
    `id_oficio` INTEGER NOT NULL AUTO_INCREMENT,
    `id_historial` INTEGER NOT NULL,
    `numero_oficio` VARCHAR(191) NOT NULL,
    `fecha_oficio` DATE NOT NULL,
    `tipo_oficio` VARCHAR(191) NOT NULL,
    `texto_oficio` TEXT NOT NULL,

    PRIMARY KEY (`id_oficio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DL_ESTUDIANTE` ADD CONSTRAINT `DL_ESTUDIANTE_id_programa_academico_fkey` FOREIGN KEY (`id_programa_academico`) REFERENCES `DL_PROGRAMA_ACADEMICO`(`id_programa_academico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_PROGRAMA_ACADEMICO` ADD CONSTRAINT `DL_PROGRAMA_ACADEMICO_id_facultad_fkey` FOREIGN KEY (`id_facultad`) REFERENCES `DL_FACULTAD`(`id_facultad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_OPCION_GRADO` ADD CONSTRAINT `DL_OPCION_GRADO_id_programa_academico_fkey` FOREIGN KEY (`id_programa_academico`) REFERENCES `DL_PROGRAMA_ACADEMICO`(`id_programa_academico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_TRABAJO_GRADO` ADD CONSTRAINT `DL_TRABAJO_GRADO_id_opcion_grado_fkey` FOREIGN KEY (`id_opcion_grado`) REFERENCES `DL_OPCION_GRADO`(`id_opcion_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_TRABAJO_GRADO` ADD CONSTRAINT `DL_TRABAJO_GRADO_id_estado_actual_fkey` FOREIGN KEY (`id_estado_actual`) REFERENCES `DL_ESTADO_TG`(`id_estado_tg`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_EST_EST_TG` ADD CONSTRAINT `DL_EST_EST_TG_id_estudiante_fkey` FOREIGN KEY (`id_estudiante`) REFERENCES `DL_ESTUDIANTE`(`id_estudiante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_EST_EST_TG` ADD CONSTRAINT `DL_EST_EST_TG_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_ASIGNACION_ASESOR` ADD CONSTRAINT `DL_ASIGNACION_ASESOR_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_ASIGNACION_ASESOR` ADD CONSTRAINT `DL_ASIGNACION_ASESOR_id_docente_asesor_fkey` FOREIGN KEY (`id_docente_asesor`) REFERENCES `DL_DOCENTE`(`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_ASIGNACION_JURADO` ADD CONSTRAINT `DL_ASIGNACION_JURADO_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_ASIGNACION_JURADO` ADD CONSTRAINT `DL_ASIGNACION_JURADO_id_docente_jurado_fkey` FOREIGN KEY (`id_docente_jurado`) REFERENCES `DL_DOCENTE`(`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_HIST_ESTADO_TG` ADD CONSTRAINT `DL_HIST_ESTADO_TG_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_HIST_ESTADO_TG` ADD CONSTRAINT `DL_HIST_ESTADO_TG_id_estado_tg_fkey` FOREIGN KEY (`id_estado_tg`) REFERENCES `DL_ESTADO_TG`(`id_estado_tg`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_HIST_ESTADO_TG` ADD CONSTRAINT `DL_HIST_ESTADO_TG_id_consejo_facultad_fkey` FOREIGN KEY (`id_consejo_facultad`) REFERENCES `DL_CONSEJO_FACULTAD`(`id_consejo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_DET_PRACT_PROF` ADD CONSTRAINT `DL_DET_PRACT_PROF_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_DET_PRACT_PROF` ADD CONSTRAINT `DL_DET_PRACT_PROF_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `DL_EMPRESA`(`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_SUSTENTACION` ADD CONSTRAINT `DL_SUSTENTACION_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `DL_TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_DOC_ADJ_TRG` ADD CONSTRAINT `DL_DOC_ADJ_TRG_id_historial_fkey` FOREIGN KEY (`id_historial`) REFERENCES `DL_HIST_ESTADO_TG`(`id_historial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DL_OFICIO` ADD CONSTRAINT `DL_OFICIO_id_historial_fkey` FOREIGN KEY (`id_historial`) REFERENCES `DL_HIST_ESTADO_TG`(`id_historial`) ON DELETE RESTRICT ON UPDATE CASCADE;
