/*
  Warnings:

  - The primary key for the `ACTORES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DISTINCIONES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DISTINCION_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EMPRESA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ESTADO_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FACULTAD` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `NIVEL_FORMACION` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OPCION_GRADO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PERSONA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PROGRAMA_ACADEMICO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SEGUIMIENTO_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TIPO_DOCUMENTO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TIPO_ROL` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TRABAJO_GRADO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `accion_seg` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `opcion_grado_formacion` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_id_persona_fkey`;

-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_id_tipo_rol_fkey`;

-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_id_trabajo_grado_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_id_distincion_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_id_seguimiento_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_id_trabajo_grado_fkey`;

-- DropForeignKey
ALTER TABLE `PERSONA` DROP FOREIGN KEY `PERSONA_id_tipo_doc_identidad_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` DROP FOREIGN KEY `PROGRAMA_ACADEMICO_id_facultad_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` DROP FOREIGN KEY `PROGRAMA_ACADEMICO_id_nivel_formacion_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_id_accion_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_id_actor_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_id_estado_anterior_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_id_estado_nuevo_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_id_trabajo_grado_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_id_empresa_practica_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_id_estado_actual_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_id_opcion_grado_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_id_programa_academico_fkey`;

-- DropForeignKey
ALTER TABLE `opcion_grado_formacion` DROP FOREIGN KEY `opcion_grado_formacion_id_nivel_formacion_fkey`;

-- DropForeignKey
ALTER TABLE `opcion_grado_formacion` DROP FOREIGN KEY `opcion_grado_formacion_id_opcion_grado_fkey`;

-- AlterTable
ALTER TABLE `ACTORES` DROP PRIMARY KEY,
    MODIFY `id_actor` VARCHAR(191) NOT NULL,
    MODIFY `id_persona` VARCHAR(191) NOT NULL,
    MODIFY `id_tipo_rol` VARCHAR(191) NOT NULL,
    MODIFY `id_trabajo_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_actor`);

-- AlterTable
ALTER TABLE `DISTINCIONES` DROP PRIMARY KEY,
    MODIFY `id_distincion` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_distincion`);

-- AlterTable
ALTER TABLE `DISTINCION_TG` DROP PRIMARY KEY,
    MODIFY `id_distincion` VARCHAR(191) NOT NULL,
    MODIFY `id_distincion_tg` VARCHAR(191) NOT NULL,
    MODIFY `id_seguimiento` VARCHAR(191) NOT NULL,
    MODIFY `id_trabajo_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_distincion_tg`);

-- AlterTable
ALTER TABLE `EMPRESA` DROP PRIMARY KEY,
    MODIFY `id_empresa` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_empresa`);

-- AlterTable
ALTER TABLE `ESTADO_TG` DROP PRIMARY KEY,
    MODIFY `id_estado_tg` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_estado_tg`);

-- AlterTable
ALTER TABLE `FACULTAD` DROP PRIMARY KEY,
    MODIFY `id_facultad` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_facultad`);

-- AlterTable
ALTER TABLE `NIVEL_FORMACION` DROP PRIMARY KEY,
    MODIFY `id_nivel` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_nivel`);

-- AlterTable
ALTER TABLE `OPCION_GRADO` DROP PRIMARY KEY,
    MODIFY `id_opcion_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_opcion_grado`);

-- AlterTable
ALTER TABLE `PERSONA` DROP PRIMARY KEY,
    MODIFY `id_persona` VARCHAR(191) NOT NULL,
    MODIFY `id_tipo_doc_identidad` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_persona`);

-- AlterTable
ALTER TABLE `PROGRAMA_ACADEMICO` DROP PRIMARY KEY,
    MODIFY `id_facultad` VARCHAR(191) NOT NULL,
    MODIFY `id_nivel_formacion` VARCHAR(191) NOT NULL,
    MODIFY `id_programa` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_programa`);

-- AlterTable
ALTER TABLE `SEGUIMIENTO_TG` DROP PRIMARY KEY,
    MODIFY `id_accion` VARCHAR(191) NOT NULL,
    MODIFY `id_actor` VARCHAR(191) NOT NULL,
    MODIFY `id_estado_anterior` VARCHAR(191) NULL,
    MODIFY `id_estado_nuevo` VARCHAR(191) NULL,
    MODIFY `id_seguimiento` VARCHAR(191) NOT NULL,
    MODIFY `id_trabajo_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_seguimiento`);

-- AlterTable
ALTER TABLE `TIPO_DOCUMENTO` DROP PRIMARY KEY,
    MODIFY `id_tipo_documento` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_tipo_documento`);

-- AlterTable
ALTER TABLE `TIPO_ROL` DROP PRIMARY KEY,
    MODIFY `id_rol` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_rol`);

-- AlterTable
ALTER TABLE `TRABAJO_GRADO` DROP PRIMARY KEY,
    MODIFY `id_empresa_practica` VARCHAR(191) NULL,
    MODIFY `id_estado_actual` VARCHAR(191) NOT NULL,
    MODIFY `id_opcion_grado` VARCHAR(191) NOT NULL,
    MODIFY `id_programa_academico` VARCHAR(191) NOT NULL,
    MODIFY `id_trabajo_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_trabajo_grado`);

-- AlterTable
ALTER TABLE `accion_seg` DROP PRIMARY KEY,
    MODIFY `id_accion` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_accion`);

-- AlterTable
ALTER TABLE `opcion_grado_formacion` DROP PRIMARY KEY,
    MODIFY `id_opcion_grado_formacion` VARCHAR(191) NOT NULL,
    MODIFY `id_nivel_formacion` VARCHAR(191) NOT NULL,
    MODIFY `id_opcion_grado` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_opcion_grado_formacion`);

-- AddForeignKey
ALTER TABLE `PERSONA` ADD CONSTRAINT `PERSONA_id_tipo_doc_identidad_fkey` FOREIGN KEY (`id_tipo_doc_identidad`) REFERENCES `TIPO_DOCUMENTO`(`id_tipo_documento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` ADD CONSTRAINT `PROGRAMA_ACADEMICO_id_nivel_formacion_fkey` FOREIGN KEY (`id_nivel_formacion`) REFERENCES `NIVEL_FORMACION`(`id_nivel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` ADD CONSTRAINT `PROGRAMA_ACADEMICO_id_facultad_fkey` FOREIGN KEY (`id_facultad`) REFERENCES `FACULTAD`(`id_facultad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opcion_grado_formacion` ADD CONSTRAINT `opcion_grado_formacion_id_opcion_grado_fkey` FOREIGN KEY (`id_opcion_grado`) REFERENCES `OPCION_GRADO`(`id_opcion_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opcion_grado_formacion` ADD CONSTRAINT `opcion_grado_formacion_id_nivel_formacion_fkey` FOREIGN KEY (`id_nivel_formacion`) REFERENCES `NIVEL_FORMACION`(`id_nivel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_id_opcion_grado_fkey` FOREIGN KEY (`id_opcion_grado`) REFERENCES `OPCION_GRADO`(`id_opcion_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_id_estado_actual_fkey` FOREIGN KEY (`id_estado_actual`) REFERENCES `ESTADO_TG`(`id_estado_tg`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_id_empresa_practica_fkey` FOREIGN KEY (`id_empresa_practica`) REFERENCES `EMPRESA`(`id_empresa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TRABAJO_GRADO` ADD CONSTRAINT `TRABAJO_GRADO_id_programa_academico_fkey` FOREIGN KEY (`id_programa_academico`) REFERENCES `PROGRAMA_ACADEMICO`(`id_programa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ACTORES` ADD CONSTRAINT `ACTORES_id_tipo_rol_fkey` FOREIGN KEY (`id_tipo_rol`) REFERENCES `TIPO_ROL`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_id_actor_fkey` FOREIGN KEY (`id_actor`) REFERENCES `ACTORES`(`id_actor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_id_accion_fkey` FOREIGN KEY (`id_accion`) REFERENCES `accion_seg`(`id_accion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_id_estado_anterior_fkey` FOREIGN KEY (`id_estado_anterior`) REFERENCES `ESTADO_TG`(`id_estado_tg`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SEGUIMIENTO_TG` ADD CONSTRAINT `SEGUIMIENTO_TG_id_estado_nuevo_fkey` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `ESTADO_TG`(`id_estado_tg`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_id_distincion_fkey` FOREIGN KEY (`id_distincion`) REFERENCES `DISTINCIONES`(`id_distincion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DISTINCION_TG` ADD CONSTRAINT `DISTINCION_TG_id_seguimiento_fkey` FOREIGN KEY (`id_seguimiento`) REFERENCES `SEGUIMIENTO_TG`(`id_seguimiento`) ON DELETE RESTRICT ON UPDATE CASCADE;
