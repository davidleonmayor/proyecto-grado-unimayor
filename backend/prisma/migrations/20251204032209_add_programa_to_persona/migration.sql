-- AlterTable
ALTER TABLE `PERSONA` ADD COLUMN `id_programa_academico` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `PERSONA_id_programa_academico_idx` ON `PERSONA`(`id_programa_academico`);

-- AddForeignKey
ALTER TABLE `PERSONA` ADD CONSTRAINT `PERSONA_id_programa_academico_fkey` FOREIGN KEY (`id_programa_academico`) REFERENCES `PROGRAMA_ACADEMICO`(`id_programa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `PERSONA` RENAME INDEX `PERSONA_id_facultad_fkey` TO `PERSONA_id_facultad_idx`;
