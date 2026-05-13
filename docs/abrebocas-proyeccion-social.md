# Proyección Social — Abrebocas

## ¿De qué trata este módulo?

Dentro del **Sistema de Gestión de Proyectos de Grado** de la UNIMAYOR existe un
módulo especializado para administrar los **Proyectos de Proyección Social**:
las iniciativas con las que la universidad articula su quehacer académico con
las necesidades de la comunidad y el territorio.

Este módulo permite a Profesores/Directores y Coordinadores **registrar,
consultar y descargar** los documentos oficiales (en formato Excel) que
soportan cada proyecto de proyección social, dejando trazabilidad de quién
los registra y cuándo.

## ¿Qué problema resuelve?

Tradicionalmente la información de proyección social se dispersa entre
correos, carpetas compartidas y archivos sueltos. Este módulo centraliza esos
documentos en un repositorio único, controlado por roles, con búsqueda por
nombre y descarga directa desde la plataforma.

## Funcionalidades principales

- **Registro de proyectos**: carga de un archivo Excel (`.xlsx` / `.xls`,
  máx. 5 MB) junto con un nombre y descripción opcional.
- **Control por rol**: solo personas con rol *Director*, *Profesor*,
  *Profesores/Directores*, *Coordinador* o *Coordinador de Carrera* pueden
  registrar documentos.
- **Búsqueda por nombre**: consulta paginada (hasta 100 resultados) que
  devuelve los proyectos ordenados del más reciente al más antiguo.
- **Descarga del archivo**: dos vías — por `id` del proyecto o por `nombre`
  exacto — con nombre de archivo normalizado e incluyendo la fecha de
  registro.
- **Trazabilidad**: cada proyecto queda asociado (cuando aplica) a la persona
  que lo registró, con su `fecha_registro`.

## ¿Cómo se almacena la información?

El archivo Excel se guarda como `LongBlob` directamente en la base de datos
MySQL junto con su `tipo_mime`, evitando dependencias de almacenamiento
externo. La entidad principal es `PROYECTO_PROYECCION_SOCIAL` y se relaciona
opcionalmente con `PERSONA` (quien lo registra), la cual a su vez se enmarca
en su `FACULTAD`, `PROGRAMA_ACADEMICO`, `NIVEL_FORMACION` y `TIPO_DOCUMENTO`.

> Ver el modelo entidad-relación completo en
> [`proyeccion-social-er.md`](./proyeccion-social-er.md).

## Endpoints expuestos

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| `POST` | `/proyeccion-social/` | Registra un nuevo proyecto con archivo | Sí + rol permitido |
| `GET`  | `/proyeccion-social/search?nombre=&limit=` | Busca por coincidencia de nombre | Sí |
| `GET`  | `/proyeccion-social/by-name/:nombre/download` | Descarga por nombre exacto | Sí |
| `GET`  | `/proyeccion-social/:id/download` | Descarga por `id_proyecto_social` | Sí |

## Stack técnico relevante

- **Backend**: Express.js 5 + Prisma + MySQL.
- **Manejo de archivos**: `multer` con `memoryStorage` y validación de
  `mimetype` y extensión.
- **Validación de entrada**: esquemas Zod en
  `socialProjection.schema.ts`.
- **Frontend**: Next.js 15 (App Router) consumiendo los endpoints anteriores.

## En una frase

> Un repositorio digital, autenticado y por roles, para registrar y
> recuperar los documentos Excel que sustentan los proyectos de
> **Proyección Social** de la UNIMAYOR.
