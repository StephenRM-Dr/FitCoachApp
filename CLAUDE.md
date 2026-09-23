# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Qué es FitCoach Pro

Monorepo (pnpm workspaces) de una plataforma de entrenamiento personal multi-rol (**Coach** / **Asesorado-Cliente**): rutinas personalizadas con periodización (Programa → Mesociclo → Microciclo → Sesión), seguimiento nutricional y de biofeedback, registro de cada sesión de ejercicio (series, RPE, RIR), planificación del coach y diagnóstico basado en anamnesis y antropometría.

## Estructura

| Módulo | Tecnología | Rol |
|---|---|---|
| `mobile/` | React Native 0.81 + Expo 54, NativeWind, Zustand, TanStack Query, React Navigation | App móvil multi-rol (producto principal) |
| `backend/` | Laravel (PHP 8.3) + PostgreSQL (Neon) + Sanctum | API REST bajo `/api/v1/...` |
| `src/` | React + Vite + shadcn/ui | Prototipo web exportado de Figma — **solo mockup, no producción** |

Nota: el README menciona "Laravel 11" y "MySQL", pero `backend/composer.json` declara `laravel/framework: ^13.7` y `backend/.env` usa `DB_CONNECTION=pgsql` contra una instancia remota de **Neon Postgres** (`*.neon.tech`), no MySQL local. La documentación de raíz (`architecture.md`, `monorepo.md`, etc.) puede estar desactualizada; el código manda.

## Comandos de desarrollo

```bash
# Backend (desde backend/)
composer install
php artisan migrate
php artisan serve          # puerto 8000
php artisan test           # tests (PHPUnit, corre contra sqlite en memoria)
vendor/bin/phpstan analyse # análisis estático (phpstan.neon)
# DB: backend/.env usa DB_CONNECTION=pgsql contra una instancia remota de Neon Postgres
# (no MySQL local). Requiere extensiones PHP pdo_pgsql y pgsql habilitadas.

# Mobile (desde mobile/)
pnpm install
pnpm start                 # Expo dev server
# Requiere EXPO_PUBLIC_API_URL en mobile/.env (IP local o ngrok; localhost NO funciona en dispositivo)
```

## Backend — mapa

- **Rutas:** `backend/routes/api.php` — todo bajo prefijo `v1`, protegido con `auth:sanctum` salvo register/login/password-reset.
- **Controladores:** `backend/app/Http/Controllers/Api/`
  - Raíz: `AuthController`, `AnamnesisController`, `AnthropometricController`, `NutritionLogController`, `CoachController` (relación coach↔cliente), `ExerciseController` (catálogo), `WorkoutLogController` (legacy).
  - `Coach/`: `ProgramController`, `MesocycleController`, `MicrocycleController`, `WorkoutSessionController` (planificación).
  - `Client/`: `WorkoutController` (programa activo, sesión, ejecución, historial).
- **Modelos:** `backend/app/Models/` — jerarquía de dominio:
  ```
  User ─ UserProfile ─ MedicalHistory ─ Anthropometric ─ NutritionLog
    └─ CoachClient (pivot coach↔cliente, un cliente tiene máx. 1 coach)
  Program → Mesocycle → Microcycle → WorkoutSession → SessionExercise (→ Exercise)
  WorkoutExecution → ExecutionSet (registro real de cada serie)
  ```
  `WorkoutLog` es legacy — su tabla fue eliminada (`drop_workout_logs_table`).
- **Otros:** `app/Services/TextCleaner.php` (sanitización), `app/Mail/PasswordResetMail.php`, `app/Http/Requests/Api/Coach/StoreWorkoutSessionRequest.php` (único FormRequest; el resto valida inline).
- El modelo `User` usa atributos PHP `#[Fillable]` / `#[Hidden]` (sintaxis moderna de Laravel).

## Mobile — mapa

- **Entrada:** `mobile/App.tsx` → `src/navigation/RootNavigator.tsx`: auth stack (Login/Register/ForcePasswordChange) y tabs condicionales por rol.
  - Asesorado: Dashboard, Workout, Progress, Nutrition, Profile.
  - Coach: Dashboard, Planning, Diagnosis (clientes), Workout, Profile + stack `SessionBuilder`.
- **Pantallas:** `src/screens/<Dominio>/<Nombre>Screen.tsx` — componentes grandes (400–700 líneas), UI + lógica juntas.
- **Servicios:** `src/services/` — `api.ts` (axios + interceptor de token desde Zustand), un servicio por dominio.
- **Estado:** `src/store/` — Zustand (`authStore` persiste sesión en AsyncStorage, `trainingStore`, `nutritionStore`). Datos de servidor vía TanStack Query en las pantallas.
- **Tema:** `src/theme/` (colores, tipografía, espaciado). `components/training`, `hooks` y `utils` existen pero están **vacíos**.

## Convenciones

- Idioma de UI, mensajes de API y docs: **español**. Código (nombres de variables/funciones): inglés.
- Endpoints nuevos: bajo `v1`, verificar SIEMPRE ownership (coach → vía `CoachClient` o `program.coach_id`; cliente → `client_id`/`user_id` del usuario autenticado).
- Mobile: pantallas consumen servicios de `src/services/`, nunca axios directo.

## Puntos críticos conocidos (ver análisis de refactorización)

- Sin middleware de roles: los checks `role === 'coach'` están dispersos e inconsistentes en controladores.
- `register` permite auto-asignarse rol `coach` sin verificación.
- Reset de contraseña envía la contraseña en texto plano por email y permite enumeración de cuentas; sin rate limiting en rutas de auth.
- Token Sanctum guardado en AsyncStorage (sin cifrar) en vez de `expo-secure-store`.
- Respuestas de API devuelven modelos Eloquent crudos (sin API Resources).
- `storeExecution` inserta sets en loop (N queries); `activeProgram` carga el árbol completo anidado.
