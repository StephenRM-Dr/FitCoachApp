# Gemini Context & Project Logic: FitCoach Pro

Este archivo define la arquitectura técnica y la lógica de flujo para el desarrollo del ecosistema FitCoach Pro. Debe ser consultado antes de cualquier generación de código.

## 1. Arquitectura de Software (Monorepo)
El proyecto se organiza en un único repositorio para mantener la consistencia entre el cliente y el servidor.

* **`/backend`**: API REST construida con **Laravel**. 
    * Gestión de autenticación (Sanctum).
    * Controladores para Anamnesis, Rutinas y Biofeedback.
    * Base de Datos: **MySQL**.
* **`/mobile`**: Aplicación móvil construida con **React Native + Expo**.
    * Navegación: React Navigation (Stack/Tabs).
    * Estado: Zustand para estado global y TanStack React Query para asincronía.

## 2. Stack Tecnológico y Entorno
* **Backend:** Laravel 11+ / PHP 8.2+.
* **Frontend:** React Native (Expo SDK).
* **DB:** MySQL (Relacional).
* **Simulación:** 
    * **NGROK:** Para exponer la API local de Laravel al dispositivo físico/simulador de Expo.
    * **Expo Go:** Para pruebas rápidas en dispositivos.

## 3. Lógica de Dominio (Core Business)
Toda funcionalidad debe respetar los pilares de FitCoach:

### A. El Flujo de Datos
1.  **Ingreso:** El usuario completa la Anamnesis (MySQL: tabla `user_profiles`, `medical_history`).
2.  **Procesamiento:** El sistema calcula la carga inicial basada en los tests de fuerza y movilidad.
3.  **Ejecución:** El usuario registra el entrenamiento (MySQL: tabla `workout_logs`).
4.  **Emergencia:** Los datos de RPE/RIR ajustan automáticamente el siguiente microciclo (Lógica de Entrenamiento Emergente).

### B. El Limpiador de Texto
* **Regla de Oro:** Todo input proveniente de `TextInput` (React Native) debe ser saneado en el backend mediante el módulo de limpieza de texto antes de persistirse en MySQL.

## 4. Reglas de Generación de Código (Instrucciones para la IA)
* **Completitud:** Nunca resumas código. Si se solicita un cambio en un controlador de Laravel, entrega el archivo completo para mantener las funcionalidades previas intactas.
* **Estilo Tailwind:** En React Native, usar `NativeWind` o estilos estructurados.
* **Endpoints:** Los endpoints deben seguir la estructura `/api/v1/resource`.
* **Conexión Móvil:** Al configurar servicios en React Native, usar la URL de **NGROK** proporcionada en la sesión actual para evitar errores de `Network Error`.
