# FitCoach Pro — Especificación del MVP (SDD)

> **Estado:** primera versión formal del alcance. No existía previamente ningún SDD/PRD en el repo — la documentación de raíz (`README.md`, `architecture.md`, `future_roadmap.md`, `Guidelines.md`) es descriptiva y parcialmente desactualizada. Este documento es la fuente de verdad del alcance del MVP a partir de ahora; sustitúyelo o versiónalo cuando el alcance cambie, no lo dejes desactualizarse en silencio.
>
> **Metodología:** Spec-Driven Development — el alcance se define primero como requisitos verificables (criterios de aceptación), y el desarrollo/código se audita contra esta spec (ver [`gap-analysis.md`](./gap-analysis.md)), no al revés.

## 1. Visión

FitCoach Pro conecta a un **Coach** con sus **Clientes (Asesorados)** para planificar y ejecutar entrenamiento con periodización real (Programa → Mesociclo → Microciclo → Sesión). El MVP reduce el producto a su **loop núcleo**: el coach diseña, el cliente ejecuta y registra. Todo lo demás (nutrición, seguimiento antropométrico avanzado, anamnesis clínica completa) es valioso pero no es lo que valida el producto — se documenta como post-MVP aunque ya exista código parcial.

## 2. Usuarios y jobs-to-be-done

| Rol | Job-to-be-done central en el MVP |
|---|---|
| **Coach** | Registrarse, vincular clientes, diseñar un programa con mesociclos/microciclos/sesiones y ejercicios, y ver qué ejecutó cada cliente. |
| **Cliente (Asesorado)** | Registrarse, quedar vinculado a un coach, ver su programa activo, ejecutar una sesión registrando series reales (peso/reps/RPE/RIR), y consultar su historial. |

## 3. Alcance in-scope del MVP

Cada bloque incluye criterios de aceptación mínimos verificables. "Cubierto hoy" es una referencia rápida — el detalle vive en `gap-analysis.md`.

### 3.1 Autenticación y cuentas
- Un visitante puede **registrarse como cliente** con nombre/email/password.
- Un visitante puede **registrarse como coach** solo si conoce un código de invitación válido (`coach_code`), para evitar auto-asignación libre del rol.
- Un usuario registrado puede **iniciar y cerrar sesión** (token Sanctum).
- Un usuario puede **solicitar recuperación de contraseña** y completar el cambio **sin que su contraseña viaje ni se muestre en texto plano en ningún canal** (email, logs, respuesta HTTP) — el mecanismo debe ser un token de un solo uso con expiración, nunca una contraseña temporal generada y enviada por correo.
- Tras un reseteo, el sistema debe **forzar el cambio de contraseña** en el siguiente login antes de permitir cualquier otra acción.

### 3.2 Relación Coach ↔ Cliente
- Un coach puede ver la lista de clientes disponibles para vincular y **asignarse** un cliente.
- Un coach puede ver **su lista de clientes** vinculados.
- Un cliente puede ver **quién es su coach** actual.
- Regla de negocio: **un cliente tiene máximo 1 coach** a la vez (ya modelado vía `CoachClient`).

### 3.3 Planificación (Coach)
- Un coach puede **crear un Programa** para un cliente vinculado (con verificación de ownership: el cliente debe estar asignado a ese coach).
- Un coach puede **crear Mesociclos** dentro de un programa, **Microciclos** dentro de un mesociclo, y **Sesiones de entrenamiento** (con sus `SessionExercise`) dentro de un microciclo.
- Un coach puede **listar los programas de un cliente específico**.
- Un coach puede **ver, editar y eliminar** cualquier Programa/Mesociclo/Microciclo/Sesión que haya creado (CRUD completo — hoy solo existe creación y lectura puntual, ver gap analysis).
- Un coach puede **listar todas sus sesiones** planificadas (índice general, hoy inexistente).

### 3.4 Ejecución (Cliente)
- Un cliente puede consultar su **programa activo** con su estructura completa.
- Un cliente puede abrir una **sesión específica** de su programa (con verificación de ownership).
- Un cliente puede **registrar la ejecución** de una sesión: series reales por ejercicio (peso, reps, RPE/RIR), guardadas de forma transaccional (si falla un set, no queda una ejecución a medias).
- Un cliente puede consultar su **historial de ejecuciones**, paginado.

### 3.5 Seguridad y calidad transversal (bloqueante, P0)
Estos requisitos aplican a **todo** el alcance de 3.1–3.4, no son una feature aparte:
- **Ningún endpoint del núcleo MVP** devuelve modelos Eloquent crudos — todas las respuestas pasan por un API Resource explícito que controla qué campos se exponen.
- **Cobertura de tests mínima** en los 4 flujos críticos: autenticación (incluyendo el nuevo flujo de reset seguro), ownership de la relación coach-cliente, creación de la jerarquía de planificación, y ejecución de sesión con sus sets.
- Todo endpoint que opera sobre un recurso de otro usuario **verifica ownership** explícitamente (coach → vía `CoachClient` o `program.coach_id`; cliente → `client_id`/`user_id` del usuario autenticado), consistente con la convención ya establecida en `CLAUDE.md`.
- El token de sesión se almacena cifrado en el cliente (ya resuelto en mobile vía `expo-secure-store` — mantener como requisito para no regresar a AsyncStorage plano).

## 4. Explícitamente fuera de alcance del MVP (post-MVP)

Estos dominios **ya tienen código funcional en el repo** (no se descarta, se reutilizará), pero no bloquean el lanzamiento del núcleo y no se auditan en profundidad en `gap-analysis.md`:

- **Nutrición**: registro y consulta de `NutritionLog`, cálculos de IMC/TMB/TDEE.
- **Progreso / Antropometría avanzada**: seguimiento histórico de `Anthropometric` más allá del registro básico.
- **Diagnosis / Anamnesis clínica completa**: ficha social, historial médico (`MedicalHistory`), perfil clínico detallado.
- **Perfil extendido**: pantallas `Appearance`, `Notifications`, `HelpSupport` (ya construidas en mobile, sin requisito de negocio crítico).
- **Roadmap futuro** de `future_roadmap.md`: modularización en `packages/`, Trainer Web Dashboard, sincronización offline, push notifications, websockets/Reverb, analítica/ML.

## 5. No-goals (decisiones explícitas de "no construir" para el MVP)

- No se construye una landing/marketing web — el producto es la app móvil.
- No se implementa edición de anamnesis/antropometría en el MVP, aunque el registro simple ya exista y se mantenga.
- No se prioriza soporte offline ni sincronización — se asume conectividad.
- No se agregan roles adicionales más allá de Coach/Cliente.
- No se optimiza rendimiento (N+1 queries, paginación avanzada) salvo que bloquee un criterio de aceptación anterior — se documenta como deuda técnica conocida, no como requisito del MVP.

## 6. Referencias

- Diagnóstico de estado actual y prioridades: [`docs/gap-analysis.md`](./gap-analysis.md)
- Puntos críticos previamente conocidos: `CLAUDE.md` (raíz del repo), sección "Puntos críticos conocidos" — parcialmente superados, ver gap analysis para el estado real.
