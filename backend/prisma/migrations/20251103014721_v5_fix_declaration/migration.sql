/*
  Warnings:

  - The primary key for the `ACTORES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ESTADO` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_ASIGNACION` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_RETIRO` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ACTOR` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PERSONA` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TIPO_ROL` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TRABAJO_GRADO` on the `ACTORES` table. All the data in the column will be lost.
  - You are about to drop the column `OBSERVACIONES` on the `ACTORES` table. All the data in the column will be lost.
  - The primary key for the `DISTINCIONES` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID_DISTINCION` on the `DISTINCIONES` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE` on the `DISTINCIONES` table. All the data in the column will be lost.
  - The primary key for the `DISTINCION_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CALIFICACION` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_DISTINCION` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_DISTINCION_TG` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_SEGUIMIENTO` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TRABAJO_GRADO` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_RESOLUCION` on the `DISTINCION_TG` table. All the data in the column will be lost.
  - The primary key for the `EMPRESA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DIRECCION` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `EMAIL` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `ESTADO` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `ID_EMPRESA` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `NIT_EMPRESA` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_EMPRESA` on the `EMPRESA` table. All the data in the column will be lost.
  - You are about to drop the column `TELEFONO` on the `EMPRESA` table. All the data in the column will be lost.
  - The primary key for the `ESTADO_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DESCRIPCION` on the `ESTADO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ESTADO_TG` on the `ESTADO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_ESTADO` on the `ESTADO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ORDEN` on the `ESTADO_TG` table. All the data in the column will be lost.
  - The primary key for the `FACULTAD` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CODIGO_FACULTAD` on the `FACULTAD` table. All the data in the column will be lost.
  - You are about to drop the column `ID_FACULTAD` on the `FACULTAD` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_FACULTAD` on the `FACULTAD` table. All the data in the column will be lost.
  - The primary key for the `NIVEL_FORMACION` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DESCRIPCION` on the `NIVEL_FORMACION` table. All the data in the column will be lost.
  - You are about to drop the column `ID_NIVEL` on the `NIVEL_FORMACION` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_NIVEL` on the `NIVEL_FORMACION` table. All the data in the column will be lost.
  - The primary key for the `OPCION_GRADO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DESCRIPCION` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ESTADO` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_CREACION` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_OPCION_GRADO` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_OPCION_GRADO` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_MODALIDAD` on the `OPCION_GRADO` table. All the data in the column will be lost.
  - The primary key for the `PERSONA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `APELLIDOS` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `BLOQUEADO_HASTA` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `CONFIRMED` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `CORREO_ELECTRONICO` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_REGISTRO` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PERSONA` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TIPO_DOC_IDENTIDAD` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `INTENTOS_FALLIDOS` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRES` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_CELULAR` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `NUM_DOC_IDENTIDAD` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `PASSWORD` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `TOKEN` on the `PERSONA` table. All the data in the column will be lost.
  - You are about to drop the column `ULTIMO_ACCESO` on the `PERSONA` table. All the data in the column will be lost.
  - The primary key for the `PROGRAMA_ACADEMICO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ESTADO` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_FACULTAD` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_NIVEL_FORMACION` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PROGRAMA` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_PROGRAMA` on the `PROGRAMA_ACADEMICO` table. All the data in the column will be lost.
  - The primary key for the `SEGUIMIENTO_TG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ARCHIVO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `CALIFICACION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `DISTINCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_OFICIO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_REGISTRO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ACCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ACTOR` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ESTADO_ANTERIOR` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ESTADO_NUEVO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_SEGUIMIENTO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TRABAJO_GRADO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_DOCUMENTO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_OFICIO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_RESOLUCION` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `RESUMEN` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_DOCUMENTO` on the `SEGUIMIENTO_TG` table. All the data in the column will be lost.
  - The primary key for the `TIPO_DOCUMENTO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DOCUMENTO` on the `TIPO_DOCUMENTO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TIPO_DOCUMENTO` on the `TIPO_DOCUMENTO` table. All the data in the column will be lost.
  - The primary key for the `TIPO_ROL` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ACTIVO` on the `TIPO_ROL` table. All the data in the column will be lost.
  - You are about to drop the column `DESCRIPCION` on the `TIPO_ROL` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_CREACION` on the `TIPO_ROL` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ROL` on the `TIPO_ROL` table. All the data in the column will be lost.
  - You are about to drop the column `NOMBRE_ROL` on the `TIPO_ROL` table. All the data in the column will be lost.
  - The primary key for the `TRABAJO_GRADO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `FECHA_FIN_ESTIMA` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_INICIO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `FECHA_REGISTRO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_EMPRESA_PRACTICA` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ESTADO_ACTUAL` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_OPCION_GRADO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_PROGRAMA_ACADEMICO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `ID_TRABAJO_GRADO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `RESUMEN` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - You are about to drop the column `TITULO_TRABAJO` on the `TRABAJO_GRADO` table. All the data in the column will be lost.
  - The primary key for the `accion_seg` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `DESCRIPCION` on the `accion_seg` table. All the data in the column will be lost.
  - You are about to drop the column `ID_ACCION` on the `accion_seg` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_ACCION` on the `accion_seg` table. All the data in the column will be lost.
  - You are about to drop the column `ID_NIVEL_FORMACION` on the `opcion_grado_formacion` table. All the data in the column will be lost.
  - You are about to drop the column `ID_OPCION_GRADO` on the `opcion_grado_formacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[num_doc_identidad]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correo_electronico]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estado` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_actor` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_persona` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tipo_rol` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_trabajo_grado` to the `ACTORES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_distincion` to the `DISTINCIONES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `DISTINCIONES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calificacion` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_distincion` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_distincion_tg` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_seguimiento` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_trabajo_grado` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_resolucion` to the `DISTINCION_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `EMPRESA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_empresa` to the `EMPRESA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nit_empresa` to the `EMPRESA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_empresa` to the `EMPRESA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_estado_tg` to the `ESTADO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_estado` to the `ESTADO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orden` to the `ESTADO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo_facultad` to the `FACULTAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_facultad` to the `FACULTAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_facultad` to the `FACULTAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_nivel` to the `NIVEL_FORMACION` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_nivel` to the `NIVEL_FORMACION` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `OPCION_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_opcion_grado` to the `OPCION_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_opcion_grado` to the `OPCION_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo_electronico` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_persona` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tipo_doc_identidad` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_doc_identidad` to the `PERSONA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_facultad` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_nivel_formacion` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_programa` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_programa` to the `PROGRAMA_ACADEMICO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_accion` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_actor` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_seguimiento` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_trabajo_grado` to the `SEGUIMIENTO_TG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documento` to the `TIPO_DOCUMENTO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tipo_documento` to the `TIPO_DOCUMENTO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_rol` to the `TIPO_ROL` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_rol` to the `TIPO_ROL` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_inicio` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_estado_actual` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_opcion_grado` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_programa_academico` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_trabajo_grado` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo_trabajo` to the `TRABAJO_GRADO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_accion` to the `accion_seg` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_accion` to the `accion_seg` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_nivel_formacion` to the `opcion_grado_formacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_opcion_grado` to the `opcion_grado_formacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_ID_PERSONA_fkey`;

-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_ID_TIPO_ROL_fkey`;

-- DropForeignKey
ALTER TABLE `ACTORES` DROP FOREIGN KEY `ACTORES_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_ID_DISTINCION_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_ID_SEGUIMIENTO_fkey`;

-- DropForeignKey
ALTER TABLE `DISTINCION_TG` DROP FOREIGN KEY `DISTINCION_TG_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `PERSONA` DROP FOREIGN KEY `PERSONA_ID_TIPO_DOC_IDENTIDAD_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` DROP FOREIGN KEY `PROGRAMA_ACADEMICO_ID_FACULTAD_fkey`;

-- DropForeignKey
ALTER TABLE `PROGRAMA_ACADEMICO` DROP FOREIGN KEY `PROGRAMA_ACADEMICO_ID_NIVEL_FORMACION_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_ID_ACCION_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_ID_ACTOR_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_ID_ESTADO_ANTERIOR_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_ID_ESTADO_NUEVO_fkey`;

-- DropForeignKey
ALTER TABLE `SEGUIMIENTO_TG` DROP FOREIGN KEY `SEGUIMIENTO_TG_ID_TRABAJO_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_ID_EMPRESA_PRACTICA_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_ID_ESTADO_ACTUAL_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_ID_OPCION_GRADO_fkey`;

-- DropForeignKey
ALTER TABLE `TRABAJO_GRADO` DROP FOREIGN KEY `TRABAJO_GRADO_ID_PROGRAMA_ACADEMICO_fkey`;

-- DropForeignKey
ALTER TABLE `opcion_grado_formacion` DROP FOREIGN KEY `opcion_grado_formacion_ID_NIVEL_FORMACION_fkey`;

-- DropForeignKey
ALTER TABLE `opcion_grado_formacion` DROP FOREIGN KEY `opcion_grado_formacion_ID_OPCION_GRADO_fkey`;

-- DropIndex
DROP INDEX `ACTORES_ID_PERSONA_idx` ON `ACTORES`;

-- DropIndex
DROP INDEX `ACTORES_ID_TIPO_ROL_idx` ON `ACTORES`;

-- DropIndex
DROP INDEX `ACTORES_ID_TRABAJO_GRADO_idx` ON `ACTORES`;

-- DropIndex
DROP INDEX `DISTINCION_TG_ID_DISTINCION_idx` ON `DISTINCION_TG`;

-- DropIndex
DROP INDEX `DISTINCION_TG_ID_SEGUIMIENTO_idx` ON `DISTINCION_TG`;

-- DropIndex
DROP INDEX `DISTINCION_TG_ID_TRABAJO_GRADO_idx` ON `DISTINCION_TG`;

-- DropIndex
DROP INDEX `PERSONA_CORREO_ELECTRONICO_idx` ON `PERSONA`;

-- DropIndex
DROP INDEX `PERSONA_CORREO_ELECTRONICO_key` ON `PERSONA`;

-- DropIndex
DROP INDEX `PERSONA_ID_TIPO_DOC_IDENTIDAD_idx` ON `PERSONA`;

-- DropIndex
DROP INDEX `PERSONA_NUM_DOC_IDENTIDAD_key` ON `PERSONA`;

-- DropIndex
DROP INDEX `PERSONA_TOKEN_idx` ON `PERSONA`;

-- DropIndex
DROP INDEX `PERSONA_TOKEN_key` ON `PERSONA`;

-- DropIndex
DROP INDEX `PROGRAMA_ACADEMICO_ID_FACULTAD_idx` ON `PROGRAMA_ACADEMICO`;

-- DropIndex
DROP INDEX `PROGRAMA_ACADEMICO_ID_NIVEL_FORMACION_idx` ON `PROGRAMA_ACADEMICO`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_ID_ACCION_idx` ON `SEGUIMIENTO_TG`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_ID_ACTOR_idx` ON `SEGUIMIENTO_TG`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_ID_ESTADO_ANTERIOR_idx` ON `SEGUIMIENTO_TG`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_ID_ESTADO_NUEVO_idx` ON `SEGUIMIENTO_TG`;

-- DropIndex
DROP INDEX `SEGUIMIENTO_TG_ID_TRABAJO_GRADO_idx` ON `SEGUIMIENTO_TG`;

-- DropIndex
DROP INDEX `TRABAJO_GRADO_ID_EMPRESA_PRACTICA_idx` ON `TRABAJO_GRADO`;

-- DropIndex
DROP INDEX `TRABAJO_GRADO_ID_ESTADO_ACTUAL_idx` ON `TRABAJO_GRADO`;

-- DropIndex
DROP INDEX `TRABAJO_GRADO_ID_OPCION_GRADO_idx` ON `TRABAJO_GRADO`;

-- DropIndex
DROP INDEX `TRABAJO_GRADO_ID_PROGRAMA_ACADEMICO_idx` ON `TRABAJO_GRADO`;

-- DropIndex
DROP INDEX `opcion_grado_formacion_ID_NIVEL_FORMACION_idx` ON `opcion_grado_formacion`;

-- DropIndex
DROP INDEX `opcion_grado_formacion_ID_OPCION_GRADO_idx` ON `opcion_grado_formacion`;

-- AlterTable
ALTER TABLE `ACTORES` DROP PRIMARY KEY,
    DROP COLUMN `ESTADO`,
    DROP COLUMN `FECHA_ASIGNACION`,
    DROP COLUMN `FECHA_RETIRO`,
    DROP COLUMN `ID_ACTOR`,
    DROP COLUMN `ID_PERSONA`,
    DROP COLUMN `ID_TIPO_ROL`,
    DROP COLUMN `ID_TRABAJO_GRADO`,
    DROP COLUMN `OBSERVACIONES`,
    ADD COLUMN `estado` VARCHAR(20) NOT NULL,
    ADD COLUMN `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fecha_retiro` DATETIME(0) NULL,
    ADD COLUMN `id_actor` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_persona` INTEGER NOT NULL,
    ADD COLUMN `id_tipo_rol` INTEGER NOT NULL,
    ADD COLUMN `id_trabajo_grado` INTEGER NOT NULL,
    ADD COLUMN `observaciones` TEXT NULL,
    ADD PRIMARY KEY (`id_actor`);

-- AlterTable
ALTER TABLE `DISTINCIONES` DROP PRIMARY KEY,
    DROP COLUMN `ID_DISTINCION`,
    DROP COLUMN `NOMBRE`,
    ADD COLUMN `id_distincion` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`id_distincion`);

-- AlterTable
ALTER TABLE `DISTINCION_TG` DROP PRIMARY KEY,
    DROP COLUMN `CALIFICACION`,
    DROP COLUMN `FECHA`,
    DROP COLUMN `ID_DISTINCION`,
    DROP COLUMN `ID_DISTINCION_TG`,
    DROP COLUMN `ID_SEGUIMIENTO`,
    DROP COLUMN `ID_TRABAJO_GRADO`,
    DROP COLUMN `NUMERO_RESOLUCION`,
    ADD COLUMN `calificacion` DECIMAL(3, 2) NOT NULL,
    ADD COLUMN `fecha` DATE NOT NULL,
    ADD COLUMN `id_distincion` INTEGER NOT NULL,
    ADD COLUMN `id_distincion_tg` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_seguimiento` INTEGER NOT NULL,
    ADD COLUMN `id_trabajo_grado` INTEGER NOT NULL,
    ADD COLUMN `numero_resolucion` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_distincion_tg`);

-- AlterTable
ALTER TABLE `EMPRESA` DROP PRIMARY KEY,
    DROP COLUMN `DIRECCION`,
    DROP COLUMN `EMAIL`,
    DROP COLUMN `ESTADO`,
    DROP COLUMN `ID_EMPRESA`,
    DROP COLUMN `NIT_EMPRESA`,
    DROP COLUMN `NOMBRE_EMPRESA`,
    DROP COLUMN `TELEFONO`,
    ADD COLUMN `direccion` VARCHAR(200) NULL,
    ADD COLUMN `email` VARCHAR(100) NULL,
    ADD COLUMN `estado` VARCHAR(20) NOT NULL,
    ADD COLUMN `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nit_empresa` VARCHAR(50) NOT NULL,
    ADD COLUMN `nombre_empresa` VARCHAR(200) NOT NULL,
    ADD COLUMN `telefono` VARCHAR(20) NULL,
    ADD PRIMARY KEY (`id_empresa`);

-- AlterTable
ALTER TABLE `ESTADO_TG` DROP PRIMARY KEY,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `ID_ESTADO_TG`,
    DROP COLUMN `NOMBRE_ESTADO`,
    DROP COLUMN `ORDEN`,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `id_estado_tg` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_estado` VARCHAR(100) NOT NULL,
    ADD COLUMN `orden` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_estado_tg`);

-- AlterTable
ALTER TABLE `FACULTAD` DROP PRIMARY KEY,
    DROP COLUMN `CODIGO_FACULTAD`,
    DROP COLUMN `ID_FACULTAD`,
    DROP COLUMN `NOMBRE_FACULTAD`,
    ADD COLUMN `codigo_facultad` VARCHAR(20) NOT NULL,
    ADD COLUMN `id_facultad` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_facultad` VARCHAR(200) NOT NULL,
    ADD PRIMARY KEY (`id_facultad`);

-- AlterTable
ALTER TABLE `NIVEL_FORMACION` DROP PRIMARY KEY,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `ID_NIVEL`,
    DROP COLUMN `NOMBRE_NIVEL`,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `id_nivel` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_nivel` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`id_nivel`);

-- AlterTable
ALTER TABLE `OPCION_GRADO` DROP PRIMARY KEY,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `ESTADO`,
    DROP COLUMN `FECHA_CREACION`,
    DROP COLUMN `ID_OPCION_GRADO`,
    DROP COLUMN `NOMBRE_OPCION_GRADO`,
    DROP COLUMN `TIPO_MODALIDAD`,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `estado` VARCHAR(20) NOT NULL,
    ADD COLUMN `fecha_creacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id_opcion_grado` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_opcion_grado` VARCHAR(100) NOT NULL,
    ADD COLUMN `tipo_modalidad` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`id_opcion_grado`);

-- AlterTable
ALTER TABLE `PERSONA` DROP PRIMARY KEY,
    DROP COLUMN `APELLIDOS`,
    DROP COLUMN `BLOQUEADO_HASTA`,
    DROP COLUMN `CONFIRMED`,
    DROP COLUMN `CORREO_ELECTRONICO`,
    DROP COLUMN `FECHA_REGISTRO`,
    DROP COLUMN `ID_PERSONA`,
    DROP COLUMN `ID_TIPO_DOC_IDENTIDAD`,
    DROP COLUMN `INTENTOS_FALLIDOS`,
    DROP COLUMN `NOMBRES`,
    DROP COLUMN `NUMERO_CELULAR`,
    DROP COLUMN `NUM_DOC_IDENTIDAD`,
    DROP COLUMN `PASSWORD`,
    DROP COLUMN `TOKEN`,
    DROP COLUMN `ULTIMO_ACCESO`,
    ADD COLUMN `apellidos` VARCHAR(100) NOT NULL,
    ADD COLUMN `bloqueado_hasta` DATETIME(0) NULL,
    ADD COLUMN `confirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `correo_electronico` VARCHAR(100) NOT NULL,
    ADD COLUMN `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id_persona` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_tipo_doc_identidad` INTEGER NOT NULL,
    ADD COLUMN `intentos_fallidos` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `nombres` VARCHAR(100) NOT NULL,
    ADD COLUMN `num_doc_identidad` VARCHAR(50) NOT NULL,
    ADD COLUMN `numero_celular` VARCHAR(20) NULL,
    ADD COLUMN `password` VARCHAR(60) NULL,
    ADD COLUMN `token` VARCHAR(6) NULL,
    ADD COLUMN `ultimo_acceso` DATETIME(0) NULL,
    ADD PRIMARY KEY (`id_persona`);

-- AlterTable
ALTER TABLE `PROGRAMA_ACADEMICO` DROP PRIMARY KEY,
    DROP COLUMN `ESTADO`,
    DROP COLUMN `ID_FACULTAD`,
    DROP COLUMN `ID_NIVEL_FORMACION`,
    DROP COLUMN `ID_PROGRAMA`,
    DROP COLUMN `NOMBRE_PROGRAMA`,
    ADD COLUMN `estado` VARCHAR(20) NOT NULL,
    ADD COLUMN `id_facultad` INTEGER NOT NULL,
    ADD COLUMN `id_nivel_formacion` INTEGER NOT NULL,
    ADD COLUMN `id_programa` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_programa` VARCHAR(200) NOT NULL,
    ADD PRIMARY KEY (`id_programa`);

-- AlterTable
ALTER TABLE `SEGUIMIENTO_TG` DROP PRIMARY KEY,
    DROP COLUMN `ARCHIVO`,
    DROP COLUMN `CALIFICACION`,
    DROP COLUMN `DISTINCION`,
    DROP COLUMN `FECHA`,
    DROP COLUMN `FECHA_OFICIO`,
    DROP COLUMN `FECHA_REGISTRO`,
    DROP COLUMN `ID_ACCION`,
    DROP COLUMN `ID_ACTOR`,
    DROP COLUMN `ID_ESTADO_ANTERIOR`,
    DROP COLUMN `ID_ESTADO_NUEVO`,
    DROP COLUMN `ID_SEGUIMIENTO`,
    DROP COLUMN `ID_TRABAJO_GRADO`,
    DROP COLUMN `NOMBRE_DOCUMENTO`,
    DROP COLUMN `NUMERO_OFICIO`,
    DROP COLUMN `NUMERO_RESOLUCION`,
    DROP COLUMN `RESUMEN`,
    DROP COLUMN `TIPO_DOCUMENTO`,
    ADD COLUMN `archivo` LONGBLOB NULL,
    ADD COLUMN `calificacion` DECIMAL(3, 2) NULL,
    ADD COLUMN `distincion` VARCHAR(100) NULL,
    ADD COLUMN `fecha` DATE NULL,
    ADD COLUMN `fecha_oficio` DATE NULL,
    ADD COLUMN `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id_accion` INTEGER NOT NULL,
    ADD COLUMN `id_actor` INTEGER NOT NULL,
    ADD COLUMN `id_estado_anterior` INTEGER NULL,
    ADD COLUMN `id_estado_nuevo` INTEGER NULL,
    ADD COLUMN `id_seguimiento` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_trabajo_grado` INTEGER NOT NULL,
    ADD COLUMN `nombre_documento` VARCHAR(200) NULL,
    ADD COLUMN `numero_oficio` VARCHAR(50) NULL,
    ADD COLUMN `numero_resolucion` VARCHAR(50) NULL,
    ADD COLUMN `resumen` TEXT NULL,
    ADD COLUMN `tipo_documento` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`id_seguimiento`);

-- AlterTable
ALTER TABLE `TIPO_DOCUMENTO` DROP PRIMARY KEY,
    DROP COLUMN `DOCUMENTO`,
    DROP COLUMN `ID_TIPO_DOCUMENTO`,
    ADD COLUMN `documento` VARCHAR(50) NOT NULL,
    ADD COLUMN `id_tipo_documento` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id_tipo_documento`);

-- AlterTable
ALTER TABLE `TIPO_ROL` DROP PRIMARY KEY,
    DROP COLUMN `ACTIVO`,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `FECHA_CREACION`,
    DROP COLUMN `ID_ROL`,
    DROP COLUMN `NOMBRE_ROL`,
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `fecha_creacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nombre_rol` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`id_rol`);

-- AlterTable
ALTER TABLE `TRABAJO_GRADO` DROP PRIMARY KEY,
    DROP COLUMN `FECHA_FIN_ESTIMA`,
    DROP COLUMN `FECHA_INICIO`,
    DROP COLUMN `FECHA_REGISTRO`,
    DROP COLUMN `ID_EMPRESA_PRACTICA`,
    DROP COLUMN `ID_ESTADO_ACTUAL`,
    DROP COLUMN `ID_OPCION_GRADO`,
    DROP COLUMN `ID_PROGRAMA_ACADEMICO`,
    DROP COLUMN `ID_TRABAJO_GRADO`,
    DROP COLUMN `RESUMEN`,
    DROP COLUMN `TITULO_TRABAJO`,
    ADD COLUMN `fecha_fin_estima` DATE NULL,
    ADD COLUMN `fecha_inicio` DATE NOT NULL,
    ADD COLUMN `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id_empresa_practica` INTEGER NULL,
    ADD COLUMN `id_estado_actual` INTEGER NOT NULL,
    ADD COLUMN `id_opcion_grado` INTEGER NOT NULL,
    ADD COLUMN `id_programa_academico` INTEGER NOT NULL,
    ADD COLUMN `id_trabajo_grado` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `resumen` TEXT NULL,
    ADD COLUMN `titulo_trabajo` VARCHAR(500) NOT NULL,
    ADD PRIMARY KEY (`id_trabajo_grado`);

-- AlterTable
ALTER TABLE `accion_seg` DROP PRIMARY KEY,
    DROP COLUMN `DESCRIPCION`,
    DROP COLUMN `ID_ACCION`,
    DROP COLUMN `TIPO_ACCION`,
    ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `id_accion` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `tipo_accion` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`id_accion`);

-- AlterTable
ALTER TABLE `opcion_grado_formacion` DROP COLUMN `ID_NIVEL_FORMACION`,
    DROP COLUMN `ID_OPCION_GRADO`,
    ADD COLUMN `id_nivel_formacion` INTEGER NOT NULL,
    ADD COLUMN `id_opcion_grado` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `ACTORES_id_persona_idx` ON `ACTORES`(`id_persona`);

-- CreateIndex
CREATE INDEX `ACTORES_id_trabajo_grado_idx` ON `ACTORES`(`id_trabajo_grado`);

-- CreateIndex
CREATE INDEX `ACTORES_id_tipo_rol_idx` ON `ACTORES`(`id_tipo_rol`);

-- CreateIndex
CREATE INDEX `DISTINCION_TG_id_distincion_idx` ON `DISTINCION_TG`(`id_distincion`);

-- CreateIndex
CREATE INDEX `DISTINCION_TG_id_trabajo_grado_idx` ON `DISTINCION_TG`(`id_trabajo_grado`);

-- CreateIndex
CREATE INDEX `DISTINCION_TG_id_seguimiento_idx` ON `DISTINCION_TG`(`id_seguimiento`);

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_num_doc_identidad_key` ON `PERSONA`(`num_doc_identidad`);

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_correo_electronico_key` ON `PERSONA`(`correo_electronico`);

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_token_key` ON `PERSONA`(`token`);

-- CreateIndex
CREATE INDEX `PERSONA_id_tipo_doc_identidad_idx` ON `PERSONA`(`id_tipo_doc_identidad`);

-- CreateIndex
CREATE INDEX `PERSONA_correo_electronico_idx` ON `PERSONA`(`correo_electronico`);

-- CreateIndex
CREATE INDEX `PERSONA_token_idx` ON `PERSONA`(`token`);

-- CreateIndex
CREATE INDEX `PROGRAMA_ACADEMICO_id_nivel_formacion_idx` ON `PROGRAMA_ACADEMICO`(`id_nivel_formacion`);

-- CreateIndex
CREATE INDEX `PROGRAMA_ACADEMICO_id_facultad_idx` ON `PROGRAMA_ACADEMICO`(`id_facultad`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_id_trabajo_grado_idx` ON `SEGUIMIENTO_TG`(`id_trabajo_grado`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_id_actor_idx` ON `SEGUIMIENTO_TG`(`id_actor`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_id_accion_idx` ON `SEGUIMIENTO_TG`(`id_accion`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_id_estado_anterior_idx` ON `SEGUIMIENTO_TG`(`id_estado_anterior`);

-- CreateIndex
CREATE INDEX `SEGUIMIENTO_TG_id_estado_nuevo_idx` ON `SEGUIMIENTO_TG`(`id_estado_nuevo`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_id_opcion_grado_idx` ON `TRABAJO_GRADO`(`id_opcion_grado`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_id_estado_actual_idx` ON `TRABAJO_GRADO`(`id_estado_actual`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_id_empresa_practica_idx` ON `TRABAJO_GRADO`(`id_empresa_practica`);

-- CreateIndex
CREATE INDEX `TRABAJO_GRADO_id_programa_academico_idx` ON `TRABAJO_GRADO`(`id_programa_academico`);

-- CreateIndex
CREATE INDEX `opcion_grado_formacion_id_opcion_grado_idx` ON `opcion_grado_formacion`(`id_opcion_grado`);

-- CreateIndex
CREATE INDEX `opcion_grado_formacion_id_nivel_formacion_idx` ON `opcion_grado_formacion`(`id_nivel_formacion`);

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
