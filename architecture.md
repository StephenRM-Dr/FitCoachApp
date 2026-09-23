# Arquitectura de FitCoach Pro

## 🏗️ Visión General

FitCoach Pro es una plataforma integral de gestión de entrenamiento personal estructurada en un monorepo que alberga tanto el cliente móvil como la API que lo alimenta.

## 📐 Arquitectura de Alto Nivel

```text
┌─────────────────────────────────────────────────────────────┐
│                     FITCOACH MONOREPO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │     mobile/      │         │    backend/      │        │
│  │ (Cliente Móvil)  │ ◄────── │ (API / Servidor) │        │
│  └──────────────────┘  REST   └──────────────────┘        │
│     React Native                 Laravel 11               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Mobile (App Multi-Rol)

**Propósito**: Aplicación móvil multiplataforma centralizada. Dependiendo del rol del usuario autenticado (Coach vs. Asesorado), la interfaz adapta sus vistas y funcionalidades.

**Tecnologías Principales**:
- **Framework:** React Native + Expo
- **Estilos:** NativeWind (Tailwind CSS)
- **Navegación:** React Navigation (con renderizado condicional por roles)
- **Estado Global:** Zustand y TanStack React Query

**Responsabilidades**:
- Interfaz fluida y reactiva para el usuario final.
- Consumo seguro de la API REST usando autenticación por Token.
- **Rol Asesorado (Cliente):** Navegación enfocada en Home, Workouts, Progress, Nutrition, Profile.
- **Rol Coach (Entrenador):** Dashboard de gestión de clientes, asignación de rutinas, revisión de biofeedback y control de progreso general.

## ⚙️ Backend (API)

**Propósito**: Lógica de negocio central, validación, cálculo de cargas, y persistencia de datos.

**Tecnologías Principales**:
- **Framework:** Laravel 11+
- **Lenguaje:** PHP 8.2+
- **Base de Datos:** MySQL
- **Seguridad:** Laravel Sanctum para emisión de API Tokens

**Responsabilidades**:
- Proveer endpoints estandarizados (`/api/v1/...`).
- Validar y sanitizar todo el input antes de la inserción a base de datos.
- Calcular lógicas críticas (IMC, 1RM, distribución de macronutrientes).

## 🔄 Flujo de Datos

1. **Ingreso:** El usuario completa su Anamnesis y Test Físicos desde `mobile/`.
2. **Validación y Proceso:** El input es enviado a la ruta segura en `backend/` donde un sanitizador limpia el texto y luego el sistema calcula las cargas iniciales o métricas necesarias.
3. **Persistencia:** Laravel almacena la información estructurada en MySQL.
4. **Respuesta Visual:** El cliente recibe la respuesta y React Query actualiza la caché local, repintando la pantalla a través de NativeWind.
