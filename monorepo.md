# Guía del Monorepo FitCoach Pro

## ¿Qué es un Monorepo?

Un monorepo (monolithic repository) es un patrón de desarrollo donde múltiples proyectos relacionados se mantienen en un único repositorio. En lugar de tener repositorios separados para cada componente, todo el código vive junto.

## ¿Por qué Monorepo para FitCoach?

### ✅ Ventajas

1. **Código Compartido Fácil**
   - Los packages se referencian directamente
   - No necesitas publicar a pnpm para compartir código
   - Cambios inmediatos en toda la aplicación

2. **Refactoring Atómico**
   - Cambias un tipo en `@fitcoach/types`
   - Todos los errores aparecen inmediatamente
   - Fixes en un solo commit

3. **Consistencia**
   - Mismas dependencias en todos los proyectos
   - Configuración centralizada
   - Estilos de código unificados

4. **Facilita la Colaboración**
   - Todo el equipo ve todo el código
   - Pull requests más contextuales
   - Issues centralizados

### ⚠️ Desventajas (y cómo las mitigamos)

1. **Build Times**
   - 🛡️ Mitigación: Builds incrementales con Vite
   - 🛡️ Cache de pnpm

2. **Complejidad Inicial**
   - 🛡️ Mitigación: Documentación clara
   - 🛡️ Scripts de setup automatizados

## Estructura del Proyecto

```
fitcoach-monorepo/
│
├── apps/                    # Aplicaciones independientes
│   ├── mobile/             # App cliente móvil
│   │   ├── src/
│   │   │   ├── pages/      # Pantallas de la app
│   │   │   ├── components/ # Componentes específicos de mobile
│   │   │   └── routes.tsx  # Configuración de rutas
│   │   ├── package.json    # Dependencias de mobile
│   │   └── vite.config.ts  # Config de Vite para mobile
│   │
│   └── trainer/            # Dashboard del entrenador
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/               # Código compartido
│   ├── ui/                # Componentes UI
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   └── index.ts   # Exporta todos los componentes
│   │   └── package.json
│   │
│   ├── types/             # TypeScript types
│   │   ├── src/
│   │   │   └── index.ts   # Todos los tipos
│   │   └── package.json
│   │
│   └── utils/             # Funciones utilidad
│       ├── src/
│       │   └── index.ts   # Todas las funciones
│       └── package.json
│
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # Configuración del workspace
└── pnpm-lock.yaml        # Lockfile del monorepo
```

## Cómo Funciona

### 1. Workspace Configuration

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Esto le dice a pnpm que `apps/*` y `packages/*` son workspaces.

### 2. Dependencias entre Packages

**apps/mobile/package.json**:
```json
{
  "dependencies": {
    "@fitcoach/ui": "workspace:*",
    "@fitcoach/types": "workspace:*",
    "@fitcoach/utils": "workspace:*"
  }
}
```

`workspace:*` significa "usa la versión local del workspace".

### 3. Importar desde Packages

```typescript
// En apps/mobile/src/pages/Home.tsx
import { Button, Card } from '@fitcoach/ui';
import { Cliente } from '@fitcoach/types';
import { calcularIMC } from '@fitcoach/utils';

// Usas como si fueran npm packages normales
const imc = calcularIMC(peso, altura);
```

## Comandos Esenciales

### Instalación

```bash
# Instala todas las dependencias del monorepo
pnpm install

# pnpm automáticamente:
# 1. Instala deps del root
# 2. Instala deps de cada workspace
# 3. Linkea los workspaces entre sí
```

### Desarrollo

```bash
# Ejecuta la mobile app
pnpm dev

# Ejecuta el trainer dashboard
pnpm dev:trainer

# Ejecuta un comando en un workspace específico
pnpm --filter @fitcoach/mobile dev
pnpm --filter @fitcoach/trainer build
```

### Build

```bash
# Build todo el monorepo
pnpm build

# Build solo mobile
pnpm build:mobile

# Build solo trainer
pnpm build:trainer

# Build recursivo (todos los packages)
pnpm -r build
```

### Agregar Dependencias

```bash
# Agregar al root (herramientas de desarrollo)
pnpm add -D -w typescript

# Agregar a un workspace específico
pnpm --filter @fitcoach/mobile add react-query
pnpm --filter @fitcoach/ui add clsx

# Agregar a todos los workspaces
pnpm -r add date-fns
```

### Remover Dependencias

```bash
# Del workspace específico
pnpm --filter @fitcoach/mobile remove lodash

# Del root
pnpm remove -w typescript
```

## Workflow de Desarrollo

### 1. Crear un Nuevo Componente en UI

```bash
# 1. Crear el archivo
cd packages/ui/src/components
touch NewComponent.tsx

# 2. Exportarlo
# En packages/ui/src/index.ts
export * from './components/NewComponent';

# 3. Usarlo en mobile
# En apps/mobile/src/pages/SomePage.tsx
import { NewComponent } from '@fitcoach/ui';
```

### 2. Agregar un Nuevo Tipo

```typescript
// 1. En packages/types/src/index.ts
export interface NuevoTipo {
  id: string;
  nombre: string;
}

// 2. Úsalo inmediatamente en cualquier app
// En apps/mobile/src/pages/Home.tsx
import { NuevoTipo } from '@fitcoach/types';

const dato: NuevoTipo = { id: '1', nombre: 'Test' };
```

### 3. Agregar una Función Util

```typescript
// 1. En packages/utils/src/index.ts
export function nuevaFuncion(param: number): number {
  return param * 2;
}

// 2. Úsala en cualquier parte
import { nuevaFuncion } from '@fitcoach/utils';
const resultado = nuevaFuncion(5);
```

## Debugging

### Ver la Estructura del Workspace

```bash
pnpm list --depth 0
```

### Ver Dependencias de un Package

```bash
pnpm --filter @fitcoach/mobile list
```

### Verificar Links entre Workspaces

```bash
ls -la apps/mobile/node_modules/@fitcoach
# Deberías ver symlinks a ../../packages/...
```

## Troubleshooting

### "Cannot find module '@fitcoach/ui'"

**Solución**:
```bash
# 1. Verifica que el package existe
ls packages/ui

# 2. Reinstala
rm -rf node_modules
pnpm install

# 3. Verifica el package.json del workspace
cat apps/mobile/package.json | grep @fitcoach
```

### "Changes in @fitcoach/ui not reflecting"

**Solución**:
```bash
# 1. Verifica que estás usando workspace:*
# En apps/mobile/package.json debe ser:
"@fitcoach/ui": "workspace:*"

# 2. Restart dev server
pnpm dev
```

### Build Failures

**Solución**:
```bash
# 1. Clean install
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install

# 2. Build en orden
pnpm --filter @fitcoach/types build
pnpm --filter @fitcoach/utils build
pnpm --filter @fitcoach/ui build
pnpm --filter @fitcoach/mobile build
```

## Best Practices

### 1. Packages Pequeños y Focalizados

✅ **Bien**:
```
packages/
  ├── ui/           # Solo componentes UI
  ├── types/        # Solo tipos
  └── utils/        # Solo funciones puras
```

❌ **Mal**:
```
packages/
  └── shared/       # Todo mezclado
```

### 2. Dependencias Claras

✅ **Bien**:
```json
{
  "dependencies": {
    "@fitcoach/types": "workspace:*",
    "@fitcoach/utils": "workspace:*"
  }
}
```

❌ **Mal**:
```json
{
  "dependencies": {
    "@fitcoach/types": "workspace:^0.0.1"
  }
}
```

### 3. Exports Explícitos

✅ **Bien**:
```typescript
// packages/ui/src/index.ts
export { Button } from './components/Button';
export { Card } from './components/Card';
export type { ButtonProps } from './components/Button';
```

❌ **Mal**:
```typescript
// packages/ui/src/index.ts
export * from './components';
```

### 4. Versioning Consistente

Mantén la misma versión en todos los packages durante desarrollo:
```json
{
  "version": "0.0.1"
}
```

## Recursos Adicionales

- [pnpm Workspaces Docs](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Turborepo](https://turbo.build/) - Para builds más rápidos en el futuro

---

**Próximos Pasos**:
1. Familiarízate con la estructura
2. Prueba crear un componente nuevo
3. Lee ARCHITECTURE.md para entender el diseño
4. Contribuye! 🚀

