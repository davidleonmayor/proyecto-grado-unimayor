---
name: create-ui-component
description: Instrucciones estrictas para la creación de componentes UI usando componentes base existentes (shadcn/ui, iconos, Clerk) y limitando el uso de HTML crudo exclusivamente a estructura y layout (maquetado).
---

# Estrategia de Creación de Componentes

Cuando el usuario solicite crear una nueva página, vista o componente UI, debes adherirte estrictamente a estas reglas. El objetivo es mantener un código limpio, reutilizable y evitar reinventar la rueda ("Do Not Repeat Yourself").

## 1. Reutilización Estricta (No Recrear Componentes)

- **NUNCA** construyas desde cero primitivas de UI que suelen existir en librerías de diseño como **shadcn/ui** (ej. Botones, Inputs, Cards, Dialogs, dropdowns, etc.).
- Asume SIEMPRE que los componentes base se importarán de la carpeta de UI local (ej: `import { Button } from "@/components/ui/button";`).
- Utiliza componentes estándar para funcionalidades específicas:
  - `next/image` para imágenes.
  - `next/link` para enlaces.
  - `lucide-react` (u otra librería predefinida) para íconos.
  - `@clerk/nextjs` (o el sistema de auth activo) para componentes de sesión.

## 2. Uso de HTML exclusivo para Maquetado (Estructura/Layout)

- Los únicos lugares donde debes escribir código HTML crudo (`<div>`, `<section>`, `<main>`, `<span>`, `<h1>...<h6>`, `<p>`) es para construir la estructura, el esqueleto visual y el "maquetado" responsivo.
- Emplea clases de Tailwind CSS en estas etiquetas estructurales para:
  - Flexbox (`flex`, `flex-col`, `items-center`, `justify-center`, etc.).
  - Grid (`grid`, `grid-cols-X`, etc.).
  - Márgenes, paddings y espaciados (`p-4`, `max-w-...`, `mx-auto`, `gap-y-8`).
  - Posicionamiento y dimensionamiento (`relative`, `w-full`, `lg:w-[424px]`).

## 3. Composición y Estructura del Archivo

Mantén tus archivos ordenados siguiendo esta separación por secciones:

1. **Imports:**
   - 1. Core/Framework (`next/image`, `react`, etc.)
   - 2. Proveedores y Terceros (`@clerk/nextjs`, paquetes npm).
   - 3. Iconos (`lucide-react`).
   - 4. Componentes UI Base (`@/components/ui/...`).
   - 5. Otros (Hooks locales, utils).

2. **Definición del Componente:** Funcional (Arrow functions preferidas).

3. **Renderizado (Maquetado + UI Components):** Contenedores estructurales combinados con la inyección de componentes base.

## Ejemplo de Referencia

Utiliza este ejemplo exacto como inspiración para cualquier nuevo layout que se pida construir:

```tsx
import Image from "next/image";
import Link from "next/link";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";

const LayoutExample = () => {
  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      {/* Zona de Maquetado 1: Imagen Principal */}
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image src="/hero.png" fill alt="hero image" />
      </div>

      {/* Zona de Maquetado 2: Contenido e interacciones */}
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">
          Tu Título Principal Aquí
        </h1>

        <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="w-full">
                  Comienza ahora
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="default" className="w-full" asChild>
                <Link href="/dashboard">Continuar</Link>
              </Button>
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
};

export default LayoutExample;
```
