# 🚀 Quick Start - FitCoach Monorepo

## ¿Qué es esto?

Una **aplicación móvil completa** de gestión de entrenamiento personal construida como **monorepo modular**.

## 🎯 Lo que tienes ahora

```
✅ Monorepo configurado con pnpm workspaces
✅ Mobile app funcional con 5 pantallas
✅ 3 packages compartidos (ui, types, utils)
✅ Arquitectura escalable y mantenible
✅ Sistema de diseño mobile-first
```

## 📱 Mobile App (Cliente)

### Pantallas Disponibles

1. **🏠 Home** - Dashboard con resumen
   - Racha actual y sesiones del mes
   - Próxima sesión programada
   - Progreso semanal
   - Últimas marcas personales

2. **💪 Workouts** - Rutinas de entrenamiento
   - Sesiones programadas
   - Historial de entrenamientos
   - 5 métodos: LISS, HIT, AMRAP, EMOM, Fuerza

3. **📈 Progress** - Seguimiento de evolución
   - Gráfica de peso
   - Marcas personales (1RM)
   - Medidas corporales
   - Estadísticas de mejora

4. **🥗 Nutrition** - Plan nutricional
   - Cálculo de calorías (TDEE)
   - Distribución de macros
   - Checklist de hábitos
   - Adherencia semanal

5. **👤 Profile** - Perfil de usuario
   - Información personal
   - Estado de suscripción
   - Configuración
   - Mi entrenador

## 📦 Packages Compartidos

### @fitcoach/ui
Componentes reutilizables:
```tsx
<Button variant="primary">Click me</Button>
<Card padding="md">Content</Card>
<StatCard label="Peso" value="78kg" />
<BottomNav items={[...]} />
```

### @fitcoach/types
Tipos TypeScript:
```typescript
Cliente, Sesion, Ejercicio,
Antropometria, DatosNutricionales...
```

### @fitcoach/utils
Funciones útiles:
```typescript
calcularIMC(peso, altura)
calcularTMB(peso, altura, edad)
calcular1RM(peso, reps)
```

## 🎨 Diseño Mobile-First

### Bottom Navigation
```
┌─────────────────────────────┐
│                             │
│      Contenido App          │
│                             │
└─────────────────────────────┘
┌──┬────┬────┬────┬──────────┐
│🏠│ 💪 │ 📈 │ 🥗 │    👤    │
└──┴────┴────┴────┴──────────┘
```

### Colores Semánticos
- 🔵 Blue: Primario, info
- 🟢 Green: Éxito, progreso positivo
- 🟣 Purple: Premium, destacado
- 🔴 Red: Alertas, errores
- 🟠 Orange: Racha, motivación

## 🛠️ Comandos Rápidos

```bash
# Ver la app
pnpm dev

# Instalar deps
pnpm install

# Build todo
pnpm build

# Agregar dep a mobile
pnpm --filter @fitcoach/mobile add nombre-package
```

## 📂 Estructura Importante

```
src/app/           → App principal (apunta a mobile)
apps/mobile/       → Código de la mobile app
packages/ui/       → Componentes compartidos
packages/types/    → Tipos TypeScript
packages/utils/    → Utilidades
```

## 🔗 Cómo usar los Packages

En cualquier archivo de `apps/mobile`:

```typescript
// Importar componentes
import { Button, Card } from '@fitcoach/ui';

// Importar tipos
import { Cliente, Sesion } from '@fitcoach/types';

// Importar utils
import { calcularIMC } from '@fitcoach/utils';

// Usar normalmente
const imc = calcularIMC(78.8, 175);
```

## 🎯 Próximos Pasos Sugeridos

### Desarrollo Inmediato
1. ✅ Explorar la mobile app
2. ✅ Entender los packages compartidos
3. ⬜ Agregar nuevos componentes a @fitcoach/ui
4. ⬜ Conectar con Supabase (backend)

### Expansión
5. ⬜ Crear `apps/trainer` (dashboard entrenador)
6. ⬜ Agregar autenticación
7. ⬜ Implementar push notifications
8. ⬜ Modo offline

## 📚 Documentación

- `README.md` - Visión general del proyecto
- `ARCHITECTURE.md` - Arquitectura completa y detallada
- `MONOREPO.md` - Guía completa del monorepo
- `QUICK_START.md` - Este archivo

## 🆘 Necesitas Ayuda?

### Ver estructura
```bash
tree -L 3 -I 'node_modules'
```

### Ver dependencias
```bash
pnpm list --depth 0
```

### Reinstalar todo
```bash
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

## 💡 Tips

1. **Cambios en packages**: Se reflejan automáticamente en las apps
2. **TypeScript errors**: Aparecen inmediatamente en toda la codebase
3. **Hot reload**: Funciona en todo el monorepo
4. **Imports**: Usa los aliases `@fitcoach/*` siempre

## 🎉 ¡Ya está todo listo!

Tu monorepo está 100% funcional. Solo ejecuta:

```bash
pnpm dev
```

Y empieza a desarrollar! 🚀

---

**¿Preguntas?** Lee `ARCHITECTURE.md` para detalles técnicos o `MONOREPO.md` para entender el sistema de workspaces.
