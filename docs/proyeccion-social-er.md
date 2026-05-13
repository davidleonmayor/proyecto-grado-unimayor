# Diagrama Entidad-Relación — Proyección Social

Subconjunto del modelo de datos correspondiente a Proyección Social y todas sus entidades relacionadas, extraído de `backend/prisma/schema.prisma`.

```mermaid
    erDiagram
        PROYECTO_PROYECCION_SOCIAL }o--o| PERSONA : "registrado por"
        PERSONA }o--|| TIPO_DOCUMENTO : "identificada con"
        PERSONA }o--o| FACULTAD : "pertenece a"
        PERSONA }o--o| PROGRAMA_ACADEMICO : "matriculada en"
        PROGRAMA_ACADEMICO }o--|| FACULTAD : "agrupado en"
        PROGRAMA_ACADEMICO }o--|| NIVEL_FORMACION : "clasificado en"

        PROYECTO_PROYECCION_SOCIAL {
            string id_proyecto_social PK
            string nombre
            string descripcion
            datetime fecha_registro
            string tipo_mime
            bytes archivo
            string id_persona_registra FK
        }

        PERSONA {
            string id_persona PK
            string nombres
            string apellidos
            string id_tipo_doc_identidad FK
            string num_doc_identidad UK
            string numero_celular
            datetime fecha_registro
            string correo_electronico UK
            string password
            string token UK
            boolean confirmed
            datetime ultimo_acceso
            int intentos_fallidos
            datetime bloqueado_hasta
            string id_facultad FK
            string id_programa_academico FK
        }

        TIPO_DOCUMENTO {
            string id_tipo_documento PK
            string documento
        }

        FACULTAD {
            string id_facultad PK
            string nombre_facultad
            string codigo_facultad
        }

        PROGRAMA_ACADEMICO {
            string id_programa PK
            string nombre_programa
            string id_nivel_formacion FK
            string estado
            string id_facultad FK
        }

        NIVEL_FORMACION {
            string id_nivel PK
            string nombre_nivel
            string descripcion
        }
```

## Relaciones

| Origen | Destino | Cardinalidad | Campo FK | Obligatoria |
|--------|---------|--------------|----------|-------------|
| `PROYECTO_PROYECCION_SOCIAL` | `PERSONA` | N a 1 | `id_persona_registra` | No (nullable) |
| `PERSONA` | `TIPO_DOCUMENTO` | N a 1 | `id_tipo_doc_identidad` | Sí |
| `PERSONA` | `FACULTAD` | N a 1 | `id_facultad` | No (nullable) |
| `PERSONA` | `PROGRAMA_ACADEMICO` | N a 1 | `id_programa_academico` | No (nullable) |
| `PROGRAMA_ACADEMICO` | `FACULTAD` | N a 1 | `id_facultad` | Sí |
| `PROGRAMA_ACADEMICO` | `NIVEL_FORMACION` | N a 1 | `id_nivel_formacion` | Sí |

## Notas

- `PROYECTO_PROYECCION_SOCIAL.id_persona_registra` es **nullable**: un proyecto puede existir sin persona asociada al momento del registro.
- El archivo se almacena como `LongBlob` directamente en la base de datos junto con su `tipo_mime`.
- La entidad `PROYECTO_PROYECCION_SOCIAL` solo tiene relación directa con `PERSONA`. Las demás entidades (`TIPO_DOCUMENTO`, `FACULTAD`, `PROGRAMA_ACADEMICO`, `NIVEL_FORMACION`) están incluidas porque conforman el contexto académico-institucional que identifica a la persona que registra el proyecto.
- Índices definidos sobre `id_persona_registra` y `fecha_registro` para soportar consultas por autor y por orden cronológico.
