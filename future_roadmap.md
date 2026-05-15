# 🚀 Plan de Futuras Implementaciones y Escalabilidad (Roadmap)

Este documento detalla la estructura y mejoras planificadas para evolucionar el actual monorepo hacia un sistema más modular y escalable. Las siguientes propuestas se basan en arquitecturas avanzadas que facilitarán la escalabilidad a largo plazo.

## 1. Modularización de Packages (Shared Code)

A medida que el ecosistema crezca, extraeremos la lógica compartida en paquetes independientes. 

### Propuesta de Estructura:
```text
fitcoach-monorepo/
├── apps/
│   ├── mobile/           # (Actual) App para el cliente final
│   └── trainer/          # (Futuro) Dashboard web para el entrenador
└── packages/
    ├── ui/               # Componentes UI compartidos (React/React Native)
    ├── types/            # Tipos de TypeScript e Interfaces compartidas
    └── utils/            # Funciones puras: cálculos nutricionales, validaciones
```

### Beneficios Esperados:
- **`@fitcoach/types`**: Tipado consistente en toda la aplicación, reduciendo errores de desincronización de datos.
- **`@fitcoach/utils`**: Reutilización de cálculos complejos (IMC, 1RM, Macros) sin duplicar código.
- **`@fitcoach/ui`**: Sistema de diseño unificado, agilizando el desarrollo de nuevas interfaces tanto para web como para mobile.

## 2. Aplicación Web Dedicada para el Entrenador (Trainer Web Dashboard)

Actualmente, el entrenador gestiona a sus clientes directamente desde la **App Móvil** gracias a nuestro sistema Multi-Rol. El siguiente gran paso para escalar la comodidad del coach es crear una aplicación web complementaria exclusiva para entrenadores: `apps/trainer`.

### Funcionalidades Clave (En Web):
- **Gestión Multi-Cliente en Pantalla Amplia**: Visualización de la evolución global de todos los clientes activos con gráficos detallados.
- **Creador de Rutinas Avanzado**: Interfaz web *drag-and-drop* para armar mesociclos complejos con mayor velocidad.
- **Panel de Control Integral**: Centro de notificaciones sobre clientes que reportan fatiga excesiva (Biofeedback) o baja adherencia, diseñado para desktop.

## 3. Mejoras en la Arquitectura de Datos y Backend

- **Sincronización Offline**: Implementación de bases de datos locales (SQLite / WatermelonDB) en la app móvil para que los usuarios puedan registrar sus entrenamientos sin conexión a internet y sincronizar luego cuando dispongan de conexión estable.
- **Push Notifications**: Configurar notificaciones ricas (Expo Push Notifications) para recordatorios de hábitos, horas de comidas o motivación pre-entrenamiento.
- **Websockets / SSR**: Migrar componentes analíticos críticos para ser despachados en tiempo real con Laravel Reverb (o pusher).

## 4. Analíticas y Machine Learning

- Integración de algoritmos para predecir el estancamiento (mesetas) basándose en los registros de *1RM* y *RPE*.
- Sugerencias automáticas de ajuste de cargas ("Entrenamiento Emergente" autónomo).
