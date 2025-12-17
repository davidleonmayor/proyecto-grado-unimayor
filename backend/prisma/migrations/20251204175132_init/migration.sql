-- AlterTable
ALTER TABLE `EVENTO` ADD COLUMN `id_trabajo_grado` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `EVENTO_id_trabajo_grado_idx` ON `EVENTO`(`id_trabajo_grado`);

-- AddForeignKey
ALTER TABLE `EVENTO` ADD CONSTRAINT `EVENTO_id_trabajo_grado_fkey` FOREIGN KEY (`id_trabajo_grado`) REFERENCES `TRABAJO_GRADO`(`id_trabajo_grado`) ON DELETE SET NULL ON UPDATE CASCADE;
