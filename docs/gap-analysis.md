# FitCoach Pro — Gap Analysis hacia el MVP

> Diagnóstico del estado actual del código contra [`docs/mvp-spec.md`](./mvp-spec.md). Generado el 2026-09-08 a partir de lectura directa del repo (backend/, mobile/, routes/api.php, migraciones, tests). Incluye trabajo ya presente en el working tree sin commitear al momento del análisis.

## 1. Resumen ejecutivo

| Área | Completitud aprox. | Estado |
|---|---|---|
| Autenticación y cuentas | ~90% | Reset de password ya rediseñado a código de un solo uso; resto funcional |
| Relación Coach↔Cliente | ~90% | Funcional para el flujo básico |
| Planificación (Coach) | ~55% | Creación y lectura puntual OK; **falta CRUD completo** |
| Ejecución (Cliente) | ~85% | Flujo transaccional completo; falta pulir edge cases menores |
| Seguridad/calidad transversal | ~25% | Quedan **0% tests fuera de auth y API Resources casi ausentes** — mayor riesgo restante del MVP |

**Veredicto**: el esqueleto funcional del núcleo MVP existe y es sólido en varios puntos (ownership checks, transacciones, migración a `expo-secure-store`, gating del registro coach). De los tres bloqueantes P0 originales, el **reset de password inseguro ya se resolvió** (2026-09-08, ver §3). Quedan dos: cobertura de tests nula fuera de auth, y respuestas API sin control de exposición de datos. Cerrar esos dos es más urgente que completar el CRUD P1.

## 2. Tabla de gaps priorizada

### P0 — Bloqueantes críticos (no se lanza MVP sin resolverlos)

| Gap | Evidencia | Esfuerzo |
|---|---|---|
| **0% cobertura de tests de dominio** en backend fuera de auth | `backend/tests/Feature/Auth/PasswordResetTest.php` ya cubre el reset (6 tests); falta `CoachController`, `Coach/ProgramController`, `Client/WorkoutController` | Alto — mínimo 3 suites más (ownership coach-cliente, planificación, ejecución) |
| **0% cobertura de tests** en mobile | No existe ninguna carpeta/archivo de test en `mobile/` | Alto — al menos smoke tests de servicios (`authService`, `workoutService`) y flujo de ejecución |
| Respuestas API **sin control de exposición** — solo `UserResource` existe; `Program`, `Mesocycle`, `Microcycle`, `WorkoutSession`, `WorkoutExecution` se devuelven como modelos Eloquent crudos | `backend/app/Http/Resources/` solo contiene `UserResource.php`; `Coach/ProgramController.php`, `Coach/WorkoutSessionController.php`, `Client/WorkoutController.php` usan `response()->json($model)` directo | Medio — crear ~5 Resources y sustituir en los controladores del núcleo |

### P1 — Necesario para completar el alcance funcional declarado en la spec

| Gap | Evidencia | Esfuerzo |
|---|---|---|
| Sin `PUT`/`DELETE` para Program, Mesocycle, Microcycle, WorkoutSession, Exercise, CoachClient | `backend/routes/api.php:53-64` solo define `POST`/`GET` en el grupo `coach/*` | Medio — por recurso: método de controlador + ruta + validación de ownership |
| Sin índice general `GET /coach/sessions` (solo `GET /coach/sessions/{id}`) | `backend/routes/api.php:63` | Bajo |
| Mapeo `medical_histories` ↔ `AnamnesisController` sin confirmar — la migración existe pero no se verificó si el controlador la usa o si quedó huérfana | `backend/database/migrations/` (migración `medical_histories`), `AnamnesisController.php` (no auditado en detalle en este pase) | Bajo (investigación) |
| Sin `show` individual en varios recursos de planificación (p. ej. Mesocycle/Microcycle no tienen `GET` puntual, solo se accede anidado) | `backend/routes/api.php:53-64` | Bajo |

### P2 — Deuda técnica, no bloqueante para el MVP

| Gap | Evidencia | Esfuerzo |
|---|---|---|
| No existen `mobile/src/components/`, `hooks/`, `utils/` compartidos — riesgo de lógica duplicada entre pantallas grandes (`PlanningScreen` 725L, `SessionBuilderScreen` 481L, `WorkoutScreen` 585L) | Estructura de `mobile/src/` confirmada por exploración directa | Medio, mejor abordarlo cuando se dupliquen 2-3 casos reales, no preventivamente |
| Tipos de dominio dispersos: `mobile/src/types/index.ts` solo cubre entrenamiento; perfil/auth/nutrición/progreso son interfaces sueltas por servicio | `mobile/src/types/index.ts` (77L), interfaces locales en `authStore.ts`, `profileService.ts`, `nutritionService.ts`, `progressService.ts` | Bajo |
| N+1 y sobre-carga en `activeProgram` (carga árbol completo anidado) y `storeExecution` (insert de sets en loop) — ya señalado en `CLAUDE.md` | `backend/app/Http/Controllers/Api/Client/WorkoutController.php` | Medio, solo si hay evidencia real de impacto de performance |

## 3. Ya resuelto (no son gaps — evitar retrabajo)

Para que quede explícito qué **no** hace falta tocar, porque estados previos de la documentación (`CLAUDE.md`) los marcaban como pendientes y el código ya avanzó:

- **Token Sanctum cifrado**: mobile ya usa `expo-secure-store` con migración automática desde AsyncStorage legacy (`authStore.ts`). El punto crítico de `CLAUDE.md` sobre esto está desactualizado.
- **Auto-asignación libre de rol coach**: ya bloqueada por `coach_code` validado con `hash_equals` contra `config('fitcoach.coach_registration_code')` (`AuthController.php:32-40`).
- **Middleware de roles**: existe `EnsureRole.php`, registrado en `bootstrap/app.php`, aplicado consistentemente a los grupos `coach/*` y `client/*`.
- **Rate limiting en auth**: `throttle:10,1` en el grupo de auth y `throttle:3,1` adicional en reset (`routes/api.php:23-28`).
- **Anti-enumeración de cuentas**: `resetPassword` responde el mismo mensaje exista o no el email (`AuthController.php:108-121`).
- **Reset de password inseguro (P0, resuelto 2026-09-08)**: se reemplazó el envío de una contraseña temporal en texto plano por un flujo de dos pasos — `POST /v1/password/reset` genera un código de 6 dígitos (hasheado con `Hash::make`, expira a los 15 min, guardado en `password_reset_tokens`) y lo envía por correo sin tocar la contraseña real; `POST /v1/password/reset/confirm` valida el código y autentica al usuario con `force_password_change=true`, reutilizando el flujo existente de `ForcePasswordChangeScreen`. Esto también cierra un bug no documentado antes: con el flujo viejo, **pedir un reset invalidaba la contraseña real de inmediato** aunque el usuario nunca completara el proceso (vector de bloqueo de cuenta por email ajeno); ahora la contraseña real no cambia hasta confirmar el código. Cubierto por `backend/tests/Feature/Auth/PasswordResetTest.php` (6 tests). Ver `AuthController::resetPassword`/`confirmResetCode`, `routes/api.php`, `PasswordResetMail.php`, y en mobile `authService.confirmResetCode` + modal de 2 pasos en `LoginScreen.tsx`. De paso se corrigió que `User::force_password_change` no tenía cast `boolean` (Eloquent devolvía `0`/`1` crudos de SQLite/MySQL).

## 4. Roadmap sugerido (orden de ataque, sin fechas)

1. **Cerrar los P0 restantes**: reset de password ya resuelto (§3) → API Resources del núcleo (Program/Mesocycle/Microcycle/WorkoutSession/WorkoutExecution) → suite mínima de tests backend de los 3 flujos críticos restantes (ownership coach-cliente, planificación, ejecución) → smoke tests mobile. Este bloque es el que determina si el MVP es defendible con datos de salud reales.
2. **Completar CRUD P1** del núcleo: update/delete de la jerarquía de planificación, índice de sesiones, confirmar/limpiar el mapeo de `medical_histories`.
3. **Limpieza P2 mobile** (hooks/utils/components, tipos centralizados) solo si al escalar a los dominios post-MVP (nutrición, progreso, diagnosis) empieza a doler la duplicación — no antes.

## 5. Fuera de alcance de este análisis

Nutrición, Progreso/Antropometría avanzada y Diagnosis/Anamnesis completa **ya tienen pantallas y servicios funcionales** en mobile (`NutritionScreen`, `ProgressScreen`, `DiagnosisScreen`, con sus respectivos servicios) y controladores en backend (`NutritionLogController`, `AnthropometricController`, `AnamnesisController`). Se listan aquí como inventario — existen y aparentan estar operativos — pero no se auditaron línea a línea porque quedan fuera del alcance del MVP definido en `mvp-spec.md` §4. Si se decide adelantar alguno de estos dominios, requiere un pase de gap analysis dedicado equivalente a este.
