# Arquitectura del Monorepo FitCoach Pro

## 🏗️ Visión General

FitCoach Pro es una plataforma completa de gestión de entrenamiento personal construida como un monorepo con arquitectura modular, enfocada en mobile-first.

## 📐 Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                     FITCOACH MONOREPO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   @fitcoach/     │         │   @fitcoach/     │        │
│  │     mobile       │         │    trainer       │        │
│  │  (Cliente App)   │         │  (Entrenador)    │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
│           │                            │                   │
│           └─────────────┬──────────────┘                   │
│                         │                                  │
│              ┌──────────▼──────────┐                       │
│              │  Packages Shared    │                       │
│              ├─────────────────────┤                       │
│              │  @fitcoach/ui       │                       │
│              │  @fitcoach/types    │                       │
│              │  @fitcoach/utils    │                       │
│              └─────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Apps

### @fitcoach/mobile (Cliente)
**Propósito**: App móvil para que los clientes gestionen su entrenamiento

**Tecnologías**:
- React 18.3.1
- React Router 7 (navegación)
- Tailwind CSS 4 (estilos)
- Recharts (gráficas)
- Lucide React (iconos)

**Rutas Principales**:
```
/                 → Home (Dashboard)
/workouts         → Rutinas y sesiones
/progress         → Evolución y métricas
/nutrition        → Plan nutricional
/profile          → Perfil de usuario
```

**Características**:
- ✅ Bottom Navigation nativa
- ✅ Diseño mobile-first
- ✅ Gráficas interactivas
- ✅ Sistema de adherencia
- ✅ Biofeedback en tiempo real

### @fitcoach/trainer (Entrenador)
**Propósito**: Dashboard web para entrenadores

**Estado**: 🚧 Planificado

**Funcionalidades Previstas**:
- Gestión de múltiples clientes
- Panel de control centralizado
- Sistema de comunicación
- Automatización de pagos
- Generación de rutinas
- Análisis de progreso

## 📦 Packages Compartidos

### @fitcoach/ui
**Propósito**: Biblioteca de componentes UI reutilizables

**Componentes**:
```typescript
- Button       → Botón con variantes (primary, secondary, outline, ghost)
- Card         → Contenedor con padding configurable
- Input        → Input con label y validación
- StatCard     → Tarjeta de estadística con icono
- BottomNav    → Navegación inferior para mobile
```

**Uso**:
```tsx
import { Button, Card, StatCard } from '@fitcoach/ui';

<Card padding="md">
  <StatCard 
    label="Peso Actual"
    value="78.8kg"
    trend="-3.7kg"
    trendUp
  />
  <Button variant="primary">Guardar</Button>
</Card>
```

### @fitcoach/types
**Propósito**: Tipos TypeScript compartidos entre apps

**Categorías**:
```typescript
// Cliente y Diagnóstico
Cliente, FichaSocial, PerfilClinico, Antropometria, 
HabitosVida, TestFisico

// Planificación
MetodoEntrenamiento, Ejercicio, Sesion, Mesociclo

// Seguimiento
RegistroSesion, EvolucionPeso, MarcaPersonal

// Nutrición
DatosNutricionales, MacronutrienteDistribucion, 
AdherenciaDiaria, HabitoChecklist

// Gestión
Notificacion, Pago
```

### @fitcoach/utils
**Propósito**: Funciones utilitarias y cálculos

**Módulos**:

**Cálculos Nutricionales**:
```typescript
calcularIMC(peso, altura)
calcularTMB(peso, altura, edad, sexo)
calcularTDEE(tmb, nivelActividad)
clasificarIMC(imc)
```

**Cálculos de Entrenamiento**:
```typescript
calcular1RM(peso, repeticiones)
calcularPesoPorRIR(rm1, rir)
calcularAdherencia(completadas, programadas)
```

**Validaciones**:
```typescript
validarEmail(email)
validarTelefono(telefono)
```

**Formateo**:
```typescript
formatearPeso(peso)
formatearFecha(fecha)
calcularEdad(fechaNacimiento)
```

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Cliente   │
│   Interacción │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Mobile App     │
│  (Componentes)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  @fitcoach/ui   │
│  Components     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ @fitcoach/utils │
│  Cálculos       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ @fitcoach/types │
│  Validación     │
└─────────────────┘
```

## 🎯 Módulos Funcionales

### 1. Diagnóstico
**Responsabilidad**: Evaluación integral del cliente

**Componentes**:
- Ficha Social
- Perfil Clínico
- Valoración Antropométrica
- Hábitos de Vida
- Test Físicos

**Datos Capturados**:
- Información personal y disponibilidad
- Antecedentes médicos y lesiones
- Medidas corporales (peso, talla, perímetros)
- Sueño, estrés, hidratación
- Movilidad, estabilidad, fuerza (1RM)

### 2. Planificación
**Responsabilidad**: Diseño y configuración de rutinas

**Métodos Soportados**:
- **LISS**: Cardio de baja intensidad
- **HIT**: Alta intensidad por intervalos
- **AMRAP**: Máximas repeticiones en tiempo
- **EMOM**: Cada minuto en el minuto
- **Fuerza**: Desarrollo de fuerza máxima

**Variables de Carga**:
- Intensidad (% 1RM o RIR)
- Volumen (series × repeticiones)
- Densidad (descansos)
- Frecuencia (sesiones/semana)

### 3. Seguimiento
**Responsabilidad**: Monitoreo de progreso y adaptación

**Métricas**:
- Evolución de peso corporal
- Progresión de fuerza (1RM)
- RPE (Rate of Perceived Exertion)
- Adherencia a sesiones
- Biofeedback subjetivo

**Entrenamiento Emergente**:
- Sistema de alertas automáticas
- Ajuste basado en fatiga reportada
- Detección de sobreentrenamiento
- Recomendaciones de carga

### 4. Nutrición
**Responsabilidad**: Plan nutricional y adherencia

**Cálculos Automáticos**:
```
IMC = peso / (altura²)
TMB = 10×peso + 6.25×altura - 5×edad + offset
TDEE = TMB × factor_actividad
```

**Distribución de Macros**:
- Proteínas: 30% (184g para 2450 kcal)
- Carbohidratos: 45% (276g)
- Grasas: 25% (60g)

**Seguimiento**:
- Checklist diario de hábitos
- Adherencia semanal visual
- Hidratación y sueño

### 5. Gestión (Trainer Dashboard)
**Responsabilidad**: Administración de cartera de clientes

**Características**:
- Panel centralizado
- Filtros y búsqueda
- Alertas de inactividad
- Control de pagos
- Sistema de notificaciones
- Canal de comunicación

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3.1**: Biblioteca UI
- **React Router 7**: Navegación SPA
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Estilos utility-first
- **Vite 6**: Build tool rápido

### Gráficas y Visualización
- **Recharts**: Gráficas responsivas
- **Lucide React**: Sistema de iconos

### Gestión de Dependencias
- **pnpm**: Package manager rápido
- **pnpm workspaces**: Monorepo

### Desarrollo
- **ESLint**: Linting
- **Prettier**: Formateo (configurar)
- **TypeScript Strict**: Máxima seguridad de tipos

## 🔐 Seguridad y Privacidad (RGPD)

### Cumplimiento Normativo
- ✅ Cifrado de información sensible
- ✅ Consentimiento informado digital
- ✅ Anonimización de datos
- ✅ Derecho al olvido
- ✅ Portabilidad de datos

### Próximas Implementaciones
- [ ] Backend con Supabase
- [ ] Row Level Security (RLS)
- [ ] Autenticación JWT
- [ ] Logs de auditoría
- [ ] Backup automático

## 📊 Métricas de Calidad

### Performance
- **Bundle Size**: < 300KB (objetivo)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

### Mantenibilidad
- **Code Coverage**: > 80% (objetivo)
- **TypeScript Strict**: ✅
- **ESLint Errors**: 0

### Accesibilidad
- **WCAG 2.1**: Nivel AA (objetivo)
- **Keyboard Navigation**: ✅
- **Screen Reader**: Compatible

## 🚀 Roadmap

### Q2 2026
- [x] Monorepo setup
- [x] Mobile app core
- [x] Packages compartidos
- [ ] Trainer dashboard v1
- [ ] Backend Supabase

### Q3 2026
- [ ] Autenticación completa
- [ ] Push notifications
- [ ] Modo offline
- [ ] Sincronización automática

### Q4 2026
- [ ] App nativa (React Native)
- [ ] Analytics avanzado
- [ ] Machine Learning (predicciones)
- [ ] Integración wearables

## 🧪 Testing Strategy

### Unit Tests
```bash
packages/utils → 100% coverage
packages/types → Type checking
```

### Integration Tests
```bash
Mobile App → Rutas críticas
Trainer Dashboard → Flujos principales
```

### E2E Tests
```bash
Cypress/Playwright → User journeys
```

## 📝 Convenciones de Código

### Naming
- **Components**: PascalCase (`Button.tsx`)
- **Functions**: camelCase (`calcularIMC`)
- **Types**: PascalCase (`Cliente`)
- **Constants**: UPPER_SNAKE_CASE (`NIVELES_ACTIVIDAD`)

### Estructura de Archivos
```
component/
  ├── ComponentName.tsx
  ├── ComponentName.test.tsx
  ├── ComponentName.stories.tsx
  └── index.ts
```

### Imports Order
```typescript
// 1. React
import { useState } from 'react';

// 2. External libs
import { useNavigate } from 'react-router';

// 3. Internal packages
import { Button } from '@fitcoach/ui';
import { Cliente } from '@fitcoach/types';

// 4. Relative
import { Header } from './Header';
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

---

**Última actualización**: Mayo 2026
**Versión**: 0.0.1
**Mantenedores**: FitCoach Team
