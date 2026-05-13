# Diagrama Entidad-Relación

Diagrama de la base de datos del sistema de trabajos de grado de UniMayor, generado a partir de `backend/prisma/schema.prisma`.

```mermaid
erDiagram
    TIPO_DOCUMENTO ||--o{ PERSONA : "tipo de documento"
    FACULTAD ||--o{ PROGRAMA_ACADEMICO : "agrupa"
    FACULTAD ||--o{ PERSONA : "pertenece a"
    NIVEL_FORMACION ||--o{ PROGRAMA_ACADEMICO : "clasifica"
    NIVEL_FORMACION ||--o{ OPCION_GRADO_FORMACION : "vincula"
    PROGRAMA_ACADEMICO ||--o{ PERSONA : "matricula"
    PROGRAMA_ACADEMICO ||--o{ TRABAJO_GRADO : "soporta"
    OPCION_GRADO ||--o{ OPCION_GRADO_FORMACION : "habilitada en"
    OPCION_GRADO ||--o{ TRABAJO_GRADO : "modalidad"
    EMPRESA ||--o{ TRABAJO_GRADO : "práctica en"
    ESTADO_TG ||--o{ TRABAJO_GRADO : "estado actual"
    ESTADO_TG ||--o{ SEGUIMIENTO_TG : "estado anterior"
    ESTADO_TG ||--o{ SEGUIMIENTO_TG : "estado nuevo"
    TRABAJO_GRADO ||--o{ ACTORES : "involucra"
    TRABAJO_GRADO ||--o{ SEGUIMIENTO_TG : "registra"
    TRABAJO_GRADO ||--o{ DISTINCION_TG : "obtiene"
    TRABAJO_GRADO ||--o{ EVENTO : "agenda"
    PERSONA ||--o{ ACTORES : "asume rol"
    PERSONA ||--o{ MENSAJE : "envía"
    PERSONA ||--o{ MENSAJE_ENTREGA : "recibe"
    PERSONA ||--o{ PROYECTO_PROYECCION_SOCIAL : "registra"
    TIPO_ROL ||--o{ ACTORES : "define rol"
    ACTORES ||--o{ SEGUIMIENTO_TG : "ejecuta"
    ACCION_SEG ||--o{ SEGUIMIENTO_TG : "tipifica"
    SEGUIMIENTO_TG ||--o{ DISTINCION_TG : "respalda"
    DISTINCIONES ||--o{ DISTINCION_TG : "categoriza"
    MENSAJE ||--o{ MENSAJE_ENTREGA : "se entrega como"

    TIPO_DOCUMENTO {
        string id_tipo_documento PK
        string documento
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

    TIPO_ROL {
        string id_rol PK
        string nombre_rol
        string descripcion
        datetime fecha_creacion
        boolean activo
    }

    FACULTAD {
        string id_facultad PK
        string nombre_facultad
        string codigo_facultad
    }

    NIVEL_FORMACION {
        string id_nivel PK
        string nombre_nivel
        string descripcion
    }

    PROGRAMA_ACADEMICO {
        string id_programa PK
        string nombre_programa
        string id_nivel_formacion FK
        string estado
        string id_facultad FK
    }

    OPCION_GRADO {
        string id_opcion_grado PK
        string nombre_opcion_grado
        string descripcion
        string estado
        string tipo_modalidad
        datetime fecha_creacion
    }

    OPCION_GRADO_FORMACION {
        string id_opcion_grado_formacion PK
        string id_opcion_grado FK
        string id_nivel_formacion FK
    }

    EMPRESA {
        string id_empresa PK
        string nit_empresa
        string nombre_empresa
        string direccion
        string email
        string telefono
        string estado
    }

    ESTADO_TG {
        string id_estado_tg PK
        string nombre_estado
        string descripcion
        int orden
    }

    TRABAJO_GRADO {
        string id_trabajo_grado PK
        string titulo_trabajo
        string objetivos
        date fecha_fin_estima
        date fecha_inicio
        string resumen
        string id_opcion_grado FK
        string id_estado_actual FK
        datetime fecha_registro
        string id_empresa_practica FK
        string id_programa_academico FK
    }

    ACTORES {
        string id_actor PK
        string id_persona FK
        string id_trabajo_grado FK
        string id_tipo_rol FK
        datetime fecha_asignacion
        datetime fecha_retiro
        string estado
        string observaciones
    }

    ACCION_SEG {
        string id_accion PK
        string tipo_accion
        string descripcion
    }

    SEGUIMIENTO_TG {
        string id_seguimiento PK
        string id_trabajo_grado FK
        string id_actor FK
        datetime fecha_registro
        string id_accion FK
        string resumen
        string id_estado_anterior FK
        string id_estado_nuevo FK
        string numero_oficio
        date fecha_oficio
        string nombre_documento
        string tipo_documento
        bytes archivo
        decimal calificacion
        string distincion
        date fecha
        string numero_resolucion
    }

    DISTINCIONES {
        string id_distincion PK
        string nombre
    }

    DISTINCION_TG {
        string id_distincion_tg PK
        decimal calificacion
        date fecha
        string numero_resolucion
        string id_distincion FK
        string id_trabajo_grado FK
        string id_seguimiento FK
    }

    EVENTO {
        string id_evento PK
        string titulo
        string descripcion
        datetime fecha_inicio
        datetime fecha_fin
        string hora_inicio
        string hora_fin
        string prioridad
        boolean todo_el_dia
        datetime fecha_creacion
        boolean activo
        string id_trabajo_grado FK
    }

    MENSAJE {
        string id_mensaje PK
        string contenido
        string id_emisor FK
        datetime fecha_envio
        string target_rol
    }

    MENSAJE_ENTREGA {
        string id_entrega PK
        string id_mensaje FK
        string id_receptor FK
        string estado
        datetime fecha_lectura
    }

    PROYECTO_PROYECCION_SOCIAL {
        string id_proyecto_social PK
        string nombre
        string descripcion
        datetime fecha_registro
        string tipo_mime
        bytes archivo
        string id_persona_registra FK
    }

    WEBHOOK_SUBSCRIPTION {
        string id_subscription PK
        string topic
        string url
        string secret
        boolean is_active
        datetime created_at
    }
```

## Notas

- `WEBHOOK_SUBSCRIPTION` no tiene relaciones; es una tabla de configuración de webhooks.
- `SEGUIMIENTO_TG` tiene dos relaciones con `ESTADO_TG` (estado anterior y estado nuevo), modelando la transición de estados del trabajo de grado.
- `MENSAJE` y `MENSAJE_ENTREGA` implementan un patrón de mensajería 1-a-N: un mensaje se entrega a múltiples receptores con seguimiento de estado individual.
- `ACTORES` es la tabla pivote que conecta `PERSONA`, `TRABAJO_GRADO` y `TIPO_ROL`, registrando la participación temporal de cada persona en un trabajo de grado.
