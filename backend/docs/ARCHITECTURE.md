# Arquitectura Modular de la Aplicación

## Estructura General

La aplicación se organiza en módulos independientes, cada uno con sus propias rutas, controladores, servicios e interfaces. Esto permite mantener el código limpio, escalable y fácil de mantener.

```
src/
 ├─ modules/
 │   ├─ example/
 │   │   ├─ example.routes.ts       # Define endpoints y middlewares
 │   │   ├─ example.controller.ts   # Controla la lógica de las solicitudes
 │   │   ├─ example.service.ts      # Contiene la lógica de negocio
 │   │   └─ example.interfaces.ts   # Define tipos e interfaces
 │   └─ ...                         # Otros módulos similares
 ├─ routes/
 │   └─ index.ts                     # Centraliza la importación y montaje de módulos
 ├─ server.ts                        # Configuración del servidor y middlewares globales
 └─ config/
     └─ envs.ts                      # Variables de entorno
```

## Roles de los Archivos

### Rutas (`*.routes.ts`)

* Define los endpoints HTTP.
* Aplica middlewares específicos (validaciones, autenticación, etc.).
* Llama al controlador correspondiente.

### Controlador (`*.controller.ts`)

* Recibe y procesa datos de las rutas.
* Llama a los servicios para ejecutar la lógica de negocio.
* Devuelve la respuesta HTTP.

### Servicio (`*.service.ts`)

* Contiene la lógica de negocio.
* Interactúa con la base de datos o APIs externas.
* Retorna resultados al controlador.

### Interfaces/DTOs (`*.interfaces.ts` o `*.dto.ts`)

* Define estructuras de datos y tipos.
* Ayuda a TypeScript a controlar tipos y evitar errores.

## Flujo de una Petición

```
Cliente -> Rutas -> Controlador -> Servicio -> Base de datos/API -> Servicio -> Controlador -> Rutas -> Cliente
```

## Ventajas de Esta Arquitectura

* Modularidad: cada módulo es independiente.
* Escalabilidad: fácil de agregar nuevos módulos.
* Mantenibilidad: separación clara de responsabilidades.
* Reutilización: servicios y controladores pueden ser reutilizados.
* Legibilidad: código organizado y consistente.

## Buenas Prácticas

* Evitar lógica de negocio en rutas.
* Mantener controladores delgados, solo reciben y envían datos.
* Los servicios son el corazón de la lógica.
* Validar datos en rutas usando middlewares.
* Documentar cada módulo con comentarios claros.
