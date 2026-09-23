# Guía del Monorepo FitCoach Pro

## ¿Qué es el Monorepo en nuestro caso?

En FitCoach Pro usamos un único repositorio para hospedar de manera organizada las dos piezas principales del proyecto: el cliente móvil y la API.

### 📂 Estructura
```text
fitcoach-monorepo/
├── mobile/               # Contiene todo el ecosistema React Native (Expo)
├── backend/              # Contiene el ecosistema Laravel
├── pnpm-workspace.yaml   # Define los límites del workspace
└── package.json          # Raíz del proyecto
```

## 🛠️ Cómo Funciona
A través de `pnpm-workspace.yaml`, le decimos a nuestro gestor de paquetes que tanto `mobile` como `backend` forman parte del proyecto. Sin embargo, dado que usan lenguajes y stacks radicalmente distintos (JS/TS vs PHP), cada uno se ejecuta y maneja sus dependencias en su propio contexto.

**Beneficios para nuestro equipo:**
- **Sincronización:** Los cambios en los endpoints del backend se pueden probar inmediatamente con el código más reciente de la app móvil.
- **Un Solo Origen de Verdad:** Es más sencillo rastrear en qué estado estaba la app para una versión dada del backend.

## 🚀 Manejo del Proyecto

### Gestión de Dependencias
- Para agregar paquetes al móvil: 
  `cd mobile && npm install nombre-del-paquete`
- Para agregar paquetes al backend:
  `cd backend && composer require nombre/del-paquete`

### Desarrollo Secuencial
Al ser sistemas independientes, requieres dos terminales:
1. Una en `/backend` corriendo el servidor de Laravel (`php artisan serve`).
2. Una en `/mobile` corriendo el cliente móvil (`npx expo start`).
