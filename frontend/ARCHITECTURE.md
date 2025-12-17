# Arquitectura del Frontend

Este documento describe la arquitectura modular implementada en el frontend de la aplicación.

## Estructura General

La aplicación sigue una **Arquitectura Modular Simple** combinada con **Arquitectura Basada en Componentes**, diseñada para ser escalable y mantenible.

```
frontend/
├── app/                    # Next.js App Router (páginas y rutas)
├── modules/                # Módulos de dominio (lógica de negocio)
│   ├── auth/              # Módulo de autenticación
│   ├── projects/          # Módulo de proyectos
│   ├── events/            # Módulo de eventos
│   └── persons/           # Módulo de personas (estudiantes/profesores)
├── shared/                 # Código compartido entre módulos
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Hooks compartidos
│   ├── lib/               # Utilidades y servicios base
│   └── types/             # Tipos TypeScript compartidos
└── public/                 # Archivos estáticos
```

## Principios de Diseño

### 1. Separación de Responsabilidades
- **Módulos**: Contienen toda la lógica relacionada con un dominio específico
- **Shared**: Contiene código reutilizable entre módulos
- **App**: Contiene solo las páginas y configuración de rutas

### 2. Patrones Implementados

#### Repository Pattern
Los servicios actúan como repositorios que encapsulan las llamadas a la API:
```typescript
// modules/projects/services/projects.service.ts
export class ProjectsService extends BaseApiClient {
  async getProjects(): Promise<Project[]> { ... }
  async createProject(data: ProjectFormData): Promise<Project> { ... }
}
```

#### Service Layer
Cada módulo tiene su propia capa de servicios que maneja la lógica de negocio y comunicación con el backend.

#### Custom Hooks
Hooks personalizados para encapsular lógica reutilizable:
```typescript
// modules/auth/hooks/useAuth.ts
export const useAuth = (): UseAuthReturn => { ... }
```

#### Component-Based Architecture
Componentes organizados por responsabilidad:
- **UI Components**: Componentes base reutilizables (`shared/components/ui/`)
- **Layout Components**: Componentes de layout (`shared/components/layout/`)
- **Feature Components**: Componentes específicos de módulos (`modules/*/components/`)

## Estructura de Módulos

Cada módulo sigue esta estructura:

```
modules/[module-name]/
├── components/          # Componentes específicos del módulo
├── hooks/              # Hooks específicos del módulo
├── services/           # Servicios API del módulo
├── types/              # Tipos TypeScript del módulo
└── index.ts            # Exportaciones públicas del módulo
```

### Ejemplo: Módulo de Proyectos

```
modules/projects/
├── components/
│   ├── ProjectHistory.tsx
│   └── BulkUploadProjects.tsx
├── hooks/
│   └── (hooks específicos si los hay)
├── services/
│   └── projects.service.ts
├── types/
│   └── index.ts
└── index.ts
```

## Componentes Compartidos

### UI Components (`shared/components/ui/`)
Componentes base reutilizables:
- `InputField`: Campo de entrada con validación
- `Table`: Tabla de datos genérica
- `Pagination`: Controles de paginación
- `TableSearch`: Búsqueda para tablas

### Layout Components (`shared/components/layout/`)
Componentes de estructura:
- `ProtectedRoute`: HOC para proteger rutas
- `RoleProtectedRoute`: HOC para proteger rutas por rol
- `Menu`: Menú lateral de navegación
- `Navbar`: Barra de navegación superior

## Servicios Base

### BaseApiClient (`shared/lib/api/base-client.ts`)
Clase base para todos los servicios API que proporciona:
- Manejo de autenticación
- Manejo de errores
- Soporte para FormData
- Descarga de archivos

### TokenManager (`shared/lib/auth/token-manager`)
Utilidad para manejo de tokens JWT:
- Almacenamiento en localStorage
- Decodificación de tokens
- Validación de expiración

## Uso de Módulos

### Importar desde un módulo
```typescript
// Importar servicio
import { projectsService } from '@/modules/projects';

// Importar componente
import { ProjectHistory } from '@/modules/projects';

// Importar tipos
import type { Project } from '@/modules/projects';
```

### Importar desde shared
```typescript
// Importar componente UI
import { InputField, Table } from '@/shared';

// Importar hook
import { useUserRole } from '@/shared';

// Importar utilidad
import { TokenManager } from '@/shared';
```

## Convenciones

### Nombres de Archivos
- **Componentes**: PascalCase (`ProjectHistory.tsx`)
- **Servicios**: camelCase con sufijo `.service.ts` (`projects.service.ts`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Tipos**: PascalCase (`Project.ts`)

### Estructura de Componentes
```typescript
/**
 * ComponentName Component
 * Descripción breve del componente
 */

'use client'; // Si es necesario

import { ... } from '...';

export interface ComponentNameProps {
  // Props del componente
}

export const ComponentName = ({ ... }: ComponentNameProps) => {
  // Implementación
};

export default ComponentName;
```

### Estructura de Servicios
```typescript
/**
 * ServiceName Service
 * Descripción del servicio
 */

import { BaseApiClient } from '@/shared/lib/api/base-client';
import type { ... } from '../types';

export class ServiceName extends BaseApiClient {
  async methodName(): Promise<ReturnType> {
    return this.request<ReturnType>('/api/endpoint', {
      requiresAuth: true,
    });
  }
}

export const serviceName = new ServiceName();
```

## Escalabilidad

### Agregar un Nuevo Módulo

1. Crear estructura de carpetas:
```
modules/new-module/
├── components/
├── hooks/
├── services/
├── types/
└── index.ts
```

2. Crear servicio base:
```typescript
// modules/new-module/services/new-module.service.ts
import { BaseApiClient } from '@/shared/lib/api/base-client';

export class NewModuleService extends BaseApiClient {
  // Métodos del servicio
}
```

3. Exportar desde `index.ts`:
```typescript
export { newModuleService } from './services/new-module.service';
export type { ... } from './types';
```

### Agregar un Componente Compartido

1. Crear componente en `shared/components/ui/` o `shared/components/layout/`
2. Exportar desde `shared/index.ts`
3. Usar en cualquier módulo o página

## Ventajas de esta Arquitectura

1. **Escalabilidad**: Fácil agregar nuevos módulos sin afectar existentes
2. **Mantenibilidad**: Código organizado por dominio
3. **Reutilización**: Componentes y utilidades compartidas
4. **Testabilidad**: Servicios y hooks fácilmente testeables
5. **Colaboración**: Múltiples desarrolladores pueden trabajar en módulos diferentes
6. **Separación de Concerns**: Lógica de negocio separada de UI

## Próximos Pasos

- [ ] Agregar tests unitarios para servicios
- [ ] Implementar error boundaries
- [ ] Agregar loading states globales
- [ ] Implementar cache para peticiones API
- [ ] Agregar documentación de Storybook para componentes
