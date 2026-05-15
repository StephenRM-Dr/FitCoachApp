# FitCoach Pro - Monorepo

Sistema completo de gestión de entrenamiento personal con arquitectura monorepo enfocada en mobile.

## 📱 Estructura del Proyecto

```
fitcoach-monorepo/
├── apps/
│   ├── mobile/           # App móvil para clientes (React + Tailwind)
│   └── trainer/          # Dashboard para entrenadores (próximamente)
├── packages/
│   ├── ui/              # Componentes UI compartidos
│   ├── types/           # Tipos TypeScript compartidos
│   └── utils/           # Utilidades y funciones compartidas
└── pnpm-workspace.yaml
```

## 🚀 Tecnologías

- **Monorepo**: pnpm workspaces
- **Frontend**: React 18.3.1
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4.1
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite 6

## 📦 Packages

### @fitcoach/mobile
App móvil para clientes con:
- 🏠 **Home**: Dashboard con resumen de actividad
- 💪 **Workouts**: Rutinas programadas e historial
- 📈 **Progress**: Evolución de peso y marcas personales
- 🥗 **Nutrition**: Plan nutricional y adherencia
- 👤 **Profile**: Información personal y configuración

### @fitcoach/ui
Componentes UI compartidos:
- Button, Card, Input
- StatCard, BottomNav
- Todos mobile-first y reutilizables

### @fitcoach/types
Tipos TypeScript para:
- Cliente, Diagnóstico, Planificación
- Seguimiento, Nutrición, Gestión

### @fitcoach/utils
Funciones utilitarias:
- Cálculos nutricionales (IMC, TMB, TDEE)
- Cálculos de entrenamiento (1RM, RIR)
- Validaciones y formateo

## 🛠️ Comandos

```bash
# Instalar dependencias
pnpm install

# Desarrollo - Mobile App
pnpm dev

# Desarrollo - Trainer Dashboard
pnpm dev:trainer

# Build todo
pnpm build

# Build mobile
pnpm build:mobile

# Build trainer
pnpm build:trainer
```

## 🏗️ Características de la Mobile App

### Módulo de Diagnóstico
- ✅ Ficha Social completa
- ✅ Perfil Clínico
- ✅ Valoración Antropométrica
- ✅ Hábitos de Vida
- ✅ Test Físicos

### Módulo de Planificación
- ✅ Biblioteca de métodos (LISS, HIT, AMRAP, EMOM, Fuerza)
- ✅ Configuración de sesiones
- ✅ Variables de carga
- ✅ Periodización

### Módulo de Seguimiento
- ✅ Control de marcas personales
- ✅ RPE (Esfuerzo Percibido)
- ✅ Gráficas de evolución
- ✅ Biofeedback
- ✅ Entrenamiento emergente

### Módulo de Nutrición
- ✅ Cálculo de requerimientos (IMC, TMB, TDEE)
- ✅ Distribución de macronutrientes
- ✅ Monitoreo de adherencia
- ✅ Checklist de hábitos

## 🎨 Design System

La app utiliza un sistema de diseño mobile-first con:
- Bottom Navigation para navegación principal
- Cards con sombras sutiles
- Colores semánticos (blue, green, purple, red, orange)
- Componentes táctiles optimizados para móvil

## 🔐 Seguridad y Privacidad

El sistema está diseñado para cumplir con RGPD:
- Cifrado de información sensible
- Consentimiento informado digital
- Protección de datos de salud

## 📱 Mobile-First

Toda la UI está optimizada para dispositivos móviles:
- Navegación por bottom tabs
- Gestos táctiles nativos
- Diseño responsivo
- Safe area insets

## 🚧 Próximas Características

- [ ] Trainer Dashboard (apps/trainer)
- [ ] Backend con Supabase
- [ ] Autenticación y autorización
- [ ] Push notifications
- [ ] Modo offline
- [ ] Sync automático

---

Made with ❤️ by FitCoach Team
