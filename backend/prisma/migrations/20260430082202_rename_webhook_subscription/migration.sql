/*
  Warnings:

  - You are about to drop the `WEBHOOK_SUBSCRIPTION` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `WEBHOOK_SUBSCRIPTION`;

-- CreateTable
CREATE TABLE `SUSCRIPCION_WEBHOOK` (
    `id_suscripcion` VARCHAR(191) NOT NULL,
    `topico` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `secreto` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `SUSCRIPCION_WEBHOOK_topico_idx`(`topico`),
    INDEX `SUSCRIPCION_WEBHOOK_activo_idx`(`activo`),
    PRIMARY KEY (`id_suscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
