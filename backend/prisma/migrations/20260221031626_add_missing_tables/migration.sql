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

-- AddForeignKey
ALTER TABLE `MENSAJE` ADD CONSTRAINT `MENSAJE_id_emisor_fkey` FOREIGN KEY (`id_emisor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENSAJE_ENTREGA` ADD CONSTRAINT `MENSAJE_ENTREGA_id_mensaje_fkey` FOREIGN KEY (`id_mensaje`) REFERENCES `MENSAJE`(`id_mensaje`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MENSAJE_ENTREGA` ADD CONSTRAINT `MENSAJE_ENTREGA_id_receptor_fkey` FOREIGN KEY (`id_receptor`) REFERENCES `PERSONA`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;
