-- Add resumen column
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD COLUMN `resumen` VARCHAR(200) NULL;

-- Migrate objetivo_general + objetivos_especificos into new objetivos column
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` ADD COLUMN `objetivos` VARCHAR(900) NULL;

-- Copy data: concatenate both old fields (truncate to 900 chars)
UPDATE `PROYECTO_PROYECCION_SOCIAL` 
SET `objetivos` = LEFT(CONCAT(COALESCE(`objetivo_general`, ''), '\n', COALESCE(`objetivos_especificos`, '')), 900)
WHERE `objetivo_general` IS NOT NULL OR `objetivos_especificos` IS NOT NULL;

-- Drop old columns
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` DROP COLUMN `objetivo_general`;
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` DROP COLUMN `objetivos_especificos`;

-- Adjust varchar lengths for existing text columns
ALTER TABLE `PROYECTO_PROYECCION_SOCIAL` 
  MODIFY COLUMN `palabras_clave` VARCHAR(100) NULL,
  MODIFY COLUMN `identificacion_problematica` VARCHAR(1000) NULL,
  MODIFY COLUMN `propuesta_solucion` VARCHAR(700) NULL,
  MODIFY COLUMN `caracterizacion_poblacion` VARCHAR(900) NULL,
  MODIFY COLUMN `resultados_esperados` VARCHAR(700) NULL,
  MODIFY COLUMN `metodologia` VARCHAR(1000) NULL,
  MODIFY COLUMN `bibliografia` VARCHAR(600) NULL;
