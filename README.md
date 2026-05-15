# FitCoach Pro

Sistema completo de gestión de entrenamiento personal con arquitectura monorepo.

## 📱 Estructura del Proyecto

El proyecto está organizado en un monorepo que contiene tanto la aplicación cliente (móvil) como la API (servidor):

```text
fitcoach-monorepo/
├── mobile/               # App móvil multi-rol: Entrenador y Cliente (React Native + Expo)
├── backend/              # API REST (Laravel 11 + MySQL)
└── pnpm-workspace.yaml   # Configuración de workspaces
```

## 🚀 Tecnologías

### Frontend (Mobile App Multi-Rol)
- **Framework**: React Native (Expo SDK)
- **Roles**: Vistas dinámicas según el perfil (Coach vs. Asesorado). El entrenador gestiona a sus clientes directamente desde la app.
- **Estado**: Zustand y TanStack Query
- **Estilos**: NativeWind (Tailwind CSS)
- **Navegación**: React Navigation

### Backend (API)
- **Framework**: Laravel 11 (PHP)
- **Base de Datos**: MySQL
- **Autenticación**: Laravel Sanctum

## 🛠️ Desarrollo Local

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2. Conexión (Ngrok)
Para conectar el simulador o dispositivo físico con tu backend local, expón el puerto 8000:
```bash
ngrok http 8000
```
Copia la URL segura generada (https://...) y configúrala como `EXPO_PUBLIC_API_URL` en el archivo `.env` dentro de la carpeta `mobile/`.

### 3. Mobile (Expo)
```bash
cd mobile
npm install
npx expo start
```

## 🏗️ Características Principales
- **Módulo de Diagnóstico**: Fichas sociales, antropometría y perfiles clínicos.
- **Planificación**: Generación de rutinas, periodización y control de cargas.
- **Seguimiento y Nutrición**: Evolución de datos corporales, control calórico y RPE.

---
Made with ❤️ by FitCoach Team
