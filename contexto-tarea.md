# Contexto de Tarea: Ficha Técnica de Proyección Social

## Objetivo General

Ampliar el módulo de **Proyección Social** del sistema UniMayor para soportar la "Ficha Técnica de Proyectos de Proyección Social", sin romper compatibilidad con el resto del sistema.

## Objetivos Específicos

1. Expandir el schema Prisma con los campos y modelos necesarios para la Ficha Técnica
2. Limpiar funcionalidad obsoleta (importación Excel, filtros sin implementar)
3. Configurar Swagger UI con documentación auto-generada desde express-validator
4. Crear endpoints de catálogo (facultades, programas, líneas de acción)
5. Conectar frontend con los nuevos campos (formulario de creación con secciones colapsables)
6. Actualizar el seed para poblar las nuevas tablas

---

## Cambios Realizados

### 1. Schema Prisma (`backend/prisma/schema.prisma`)

**Campos nuevos en `proyecto_proyeccion_social`** (todos opcionales):
- `titulo` (antes `nombre`, ahora con `@map("nombre")`)
- `id_programa`, `id_facultad`, `id_asesor` (FKs opcionales)
- `semestre`, `ciudad` (`@map("ciudad_ejecucion")`), `departamento` (`@map("departamento_ejecucion")`)
- `duracion`, `lugar_y_tiempo_ejecucion`, `palabras_clave`
- `identificacion_problematica`, `propuesta_solucion`, `caracterizacion_poblacion`
- `objetivo_general`, `objetivos_especificos`, `resultados_esperados`
- `metodologia`, `bibliografia`, `total_presupuesto` (Decimal 15,2)

**Modelos nuevos:**
- `linea_accion` — catálogo maestro de líneas de acción
- `linea_accion_proyeccion_social` — tabla join N:M (proyecto ↔ línea), con `@@unique([id_proyecto_social, id_linea_accion])`
- `proponente_proyeccion_social` — proponentes del proyecto (persona ↔ proyecto)
- `plan_accion_proyecto` — plan de acción (objetivo, actividades, duración, responsables, meta, indicador)
- `presupuesto_equipo_humano` — presupuesto de personal (nombre, cargo, función, tipo vinculación, salario, total)
- `presupuesto_recursos` — presupuesto de materiales/equipos (tipo, descripción, valor unitario, cantidad, valor total)

### 2. Limpieza del Módulo Social Projection (Backend)

- **Eliminadas** rutas de importación Excel (`POST /`, `GET /by-name/:nombre/download`, `GET /:id/download`)
- **Eliminado** middleware `proyeccionSocialUpload` (multer para Excel)
- **Eliminados** métodos del controller: `create` (Excel), `downloadByName`, `downloadById`
- **Eliminados** métodos del service: `create` (Excel), `findByName`, `findById`
- **Eliminados** schemas de validación: `CreateSocialProjectionSchema`, `DownloadByNameSocialProjectionSchema`, `DownloadByIdSocialProjectionSchema`
- **Eliminados** tests asociados a las rutas removidas
- **Reorganizadas** rutas en 3 grupos con comentarios: Dashboard, CRUD, Anexos

**Rutas que quedan:**
| Grupo | Método | Ruta |
|-------|--------|------|
| Dashboard | GET | /dashboard |
| CRUD | GET | / |
| CRUD | GET | /me |
| CRUD | GET | /search |
| CRUD | POST | /manual |
| CRUD | GET | /:id |
| CRUD | PUT | /:id |
| CRUD | DELETE | /:id |
| Anexos | POST | /:id/anexos |
| Anexos | GET | /:id/anexos |
| Anexos | GET | /:id/anexos/:anexoId/download |
| Anexos | DELETE | /:id/anexos/:anexoId |

### 3. Swagger UI

- Instalado `swagger-ui-express` + `swagger-jsdoc` en `/api/docs`
- **Auto-generación** de request schemas desde express-validator (`config/swagger/from-validator.ts`)
- Modularizado en `config/swagger/{common.ts, auth.ts, socialProjection.ts}`
- `swagger.ts` solo compone los módulos con spread
- Documentados: 9 endpoints auth + 12 endpoints proyección social + health check
- `SWAGGER_URL` en envs con default `http://localhost:5050`, agregado a CORS origins

### 4. Limpieza Frontend

- **Eliminados** módulos `extraction` y `filter` de social-outreach (13 archivos borrados)
- **Eliminados** links en Menu.tsx y not-found.tsx
- **Desinstalados** 5 packages: `@handsontable/react-wrapper`, `handsontable`, `pdfjs-dist`, `react-datasheet-grid`, `xlsx-js-style`
- **Conservados** `xlsx` y `mammoth` (los usa `FilePreviewModal` vía dynamic import)

### 5. Módulo Catalog (Backend Nuevo)

- `src/catalog/catalog.controller.ts` + `src/catalog/catalog.routes.ts`
- Montado en `/api/catalog`
- Endpoints:
  - `GET /api/catalog/facultades` — lista todas las facultades
  - `GET /api/catalog/programas/:idFacultad` — programas filtrados por facultad
  - `GET /api/catalog/lineas-accion` — lista líneas de acción

### 6. Frontend — Formulario "Crear Proyecto"

- `frontend/app/(dashboard)/social-outreach/social-projects/admin/new/page.tsx` refactoreado
- 3 secciones colapsables: **Información General**, Plan de Acción (placeholder), Presupuesto (placeholder)
- Sección 1 implementada: título, descripción, líneas de acción (multi-checkbox desde catálogo), facultad → programa (dependiente), semestre, personas impactadas, estudiantes, docentes
- `frontend/modules/social-outreach/services/catalog.service.ts` — consume endpoints de catálogo
- Payload del `createProject` envía: `lineas_accion` (array de IDs), `semestre`, `id_programa`

### 7. Seed (`backend/prisma/seed.ts`)

- Arreglado `nombre` → `titulo` (Prisma usa nombre del modelo, no de la columna)
- Agregada limpieza de 7 tablas nuevas en orden de dependencias
- Seed de `linea_accion` con 5 líneas de catálogo
- Cada proyecto ahora se crea con ficha técnica completa (18 campos nuevos)
- Seed de sub-recursos: `linea_accion_proyeccion_social`, `proponente_proyeccion_social`, `plan_accion_proyecto`, `presupuesto_equipo_humano`, `presupuesto_recursos`

---

## Decisiones Técnicas

- **Campos opcionales** — todos los campos nuevos son nullable para no romper los 20 proyectos seedeados ni los flujos existentes
- **Líneas de acción como catálogo** — tabla maestra `linea_accion` con join table N:M en vez de string directo, permite multi-selección y consistencia
- **Auto-generación Swagger** — `buildComponentSchemas()` convierte schemas de express-validator a OpenAPI automáticamente; solo hay que registrar el nombre en `swagger.ts`
- **Cascade delete** — todos los sub-recursos (plan, presupuesto, líneas, proponentes) se eliminan automáticamente al borrar un proyecto

## Pendiente

- Completar secciones 2 (Plan de Acción) y 3 (Presupuesto) del formulario frontend
- Extender `PUT /:id` para aceptar los nuevos campos y sub-recursos (opción A: payload anidado con deleteMany + createMany en transacción)
- Documentar endpoints de catálogo en Swagger
- Agregar validación de los nuevos campos en el `PUT` del backend
