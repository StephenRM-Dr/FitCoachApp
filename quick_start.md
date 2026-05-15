# 🚀 Quick Start - FitCoach Pro

## 🎯 Lo que tienes ahora
- Un proyecto consolidado con **backend robusto en Laravel** y una **app móvil reactiva en Expo**.
- **Gestión Multi-Rol:** Inicia sesión como *Entrenador* para gestionar clientes o como *Asesorado* para ver tu progreso.

## 🛠️ Puesta en Marcha (Paso a Paso)

### 1. Levantar el Backend (API)
Abre tu terminal y navega al directorio del backend:
```bash
cd backend
# Instala las dependencias de PHP
composer install

# Configura tu entorno
cp .env.example .env
php artisan key:generate

# Crea la base de datos MySQL (Asegúrate de tener un gestor como XAMPP/Laragon corriendo)
php artisan migrate

# Inicia el servidor
php artisan serve
```
El backend estará escuchando en `http://127.0.0.1:8000`.

### 2. Exponer el Backend (Ngrok)
Como vas a testear en un móvil o simulador que requiere una red externa, expón tu local:
```bash
ngrok http 8000
```
Copia la URL `https://...ngrok-free.app` que te provea la consola.

### 3. Levantar la Mobile App
Abre una **segunda terminal**, navega a la carpeta móvil y edita las variables de entorno:
```bash
cd mobile

# Crea el archivo de variables (si no existe) y agrega la URL de ngrok
echo "EXPO_PUBLIC_API_URL=https://tu-url-de-ngrok.app/api/v1" > .env

# Instala dependencias y corre Expo
npm install
npx expo start
```

Escanea el código QR en tu dispositivo con Expo Go o presiona `a` para abrir el emulador de Android.

## 🎨 Desarrollo y Contribución
- Para editar la API: Trabaja dentro de `backend/app/Http/Controllers`.
- Para editar Pantallas: Trabaja dentro de `mobile/src/screens/`.
