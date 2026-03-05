/*
  Warnings:

  - A unique constraint covering the columns `[codigo_institucional]` on the table `PERSONA` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `PERSONA` ADD COLUMN `codigo_institucional` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `MENSAJE` (
    `id_mensaje` VARCHAR(191) NOT NULL,
    `contenido` TEXT NOT NULL,
    `id_emisor` VARCHAR(191) NOT NULL,
    `fecha_envio` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `target_rol` VARCHAR(100) NULL,

    INDEX `MENSAJE_id_emisor_idx`(`id_emisor`),
    PRIMARY KEY (`id_mensaje`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MENSAJE_ENTREGA` (
    `id_entrega` VARCHAR(191) NOT NULL,
    `id_mensaje` VARCHAR(191) NOT NULL,
    `id_receptor` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `fecha_lectura` DATETIME(0) NULL,

    INDEX `MENSAJE_ENTREGA_id_mensaje_idx`(`id_mensaje`),
    INDEX `MENSAJE_ENTREGA_id_receptor_idx`(`id_receptor`),
    INDEX `MENSAJE_ENTREGA_estado_idx`(`estado`),
    PRIMARY KEY (`id_entrega`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WEBHOOK_SUBSCRIPTION` (
    `id_subscription` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `secret` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `WEBHOOK_SUBSCRIPTION_topic_idx`(`topic`),
    INDEX `WEBHOOK_SUBSCRIPTION_is_active_idx`(`is_active`),
    PRIMARY KEY (`id_subscription`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ANUNCIO` (
    `id_anuncio` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `contenido` TEXT NOT NULL,
    `fecha_creacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id_autor` VARCHAR(191) NOT NULL,

    INDEX `ANUNCIO_id_autor_idx`(`id_autor`),
    INDEX `ANUNCIO_fecha_creacion_idx`(`fecha_creacion`),
    PRIMARY KEY (`id_anuncio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ANUNCIO_LEIDO` (
    `id_lectura` VARCHAR(191) NOT NULL,
    `id_anuncio` VARCHAR(191) NOT NULL,
    `id_persona` VARCHAR(191) NOT NULL,
    `fecha_lectura` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ANUNCIO_LEIDO_id_anuncio_idx`(`id_anuncio`),
    INDEX `ANUNCIO_LEIDO_id_persona_idx`(`id_persona`),
    UNIQUE INDEX `ANUNCIO_LEIDO_id_anuncio_id_persona_key`(`id_anuncio`, `id_persona`),
    PRIMARY KEY (`id_lectura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `PERSONA_codigo_institucional_key` ON `PERSONA`(`codigo_institucional`);

-- AddForeignKey
ALTER TABLE `MENSAJE` ADD CONSTRAINT `MENSAJE_id_emisor_fkey` FOREIGN KEY (`id_emisor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENSAJE_ENTREGA` ADD CONSTRAINT `MENSAJE_ENTREGA_id_mensaje_fkey` FOREIGN KEY (`id_mensaje`) REFERENCES `MENSAJE`(`id_mensaje`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENSAJE_ENTREGA` ADD CONSTRAINT `MENSAJE_ENTREGA_id_receptor_fkey` FOREIGN KEY (`id_receptor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ANUNCIO` ADD CONSTRAINT `ANUNCIO_id_autor_fkey` FOREIGN KEY (`id_autor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ANUNCIO_LEIDO` ADD CONSTRAINT `ANUNCIO_LEIDO_id_anuncio_fkey` FOREIGN KEY (`id_anuncio`) REFERENCES `ANUNCIO`(`id_anuncio`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ANUNCIO_LEIDO` ADD CONSTRAINT `ANUNCIO_LEIDO_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;
