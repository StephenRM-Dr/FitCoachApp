# Informe de cumplimiento — FitCoach Pro — 2026-09-26

> Borrador técnico, no constituye asesoría legal. Revisar con abogado los puntos marcados ⚖️.

## Jurisdicciones consideradas

**No confirmadas por el titular** → `[COMPLETAR: país del titular y países de los usuarios]`. Mientras tanto, los textos se redactaron con el estándar más estricto (GDPR / consentimiento explícito para datos de salud) y son compatibles en lo esencial con:

- Venezuela: CRBV arts. 28 (habeas data) y 60; Ley sobre Mensajes de Datos y Firmas Electrónicas (aceptación electrónica).
- Colombia (si hay usuarios allí): Ley 1581 de 2012 y Decreto 1377 de 2013 — los datos de salud son **sensibles**, exigen autorización previa, expresa e informada; política de tratamiento y aviso de privacidad obligatorios. ⚖️
- UE/UK (si hay usuarios allí): GDPR — los datos de salud son categoría especial (consentimiento explícito).
- Tiendas de apps: Apple (URL de política, eliminación de cuenta dentro de la app) y Google Play (formulario Data Safety, enlace web de eliminación de datos).

Vigencia de normas no verificada con búsqueda web en esta sesión.

## Resumen

| Área | Estado | Notas |
|---|---|---|
| Política de privacidad | ⚠️ parcial | Redactada y accesible en la app; faltan datos del titular y terceros (`[COMPLETAR]`); falta URL pública para tiendas |
| Términos y condiciones | ⚠️ parcial | Redactados con aviso médico; faltan ley aplicable y datos del titular |
| Consentimiento en registro | ✅ corregido | Casillas sin premarcar (términos + datos de salud, separadas), obligatorias en backend, con evidencia (fecha + versión) |
| Datos sensibles (salud) | ⚠️ parcial | Consentimiento explícito y separado para clientes; sin cifrado a nivel de aplicación; sin flujo de re-consentimiento para cuentas previas |
| Eliminación de cuenta | ✅ corregido | `DELETE /api/v1/account` + pantalla Seguridad → Eliminar cuenta (pide contraseña) |
| Exportación / acceso a datos | ❌ pendiente | Sin endpoint de exportación; la política lo canaliza por correo |
| Cookies / banner | ✅ no aplica | App móvil sin cookies ni SDK de terceros; ver decisión abajo |
| Analíticas / tracking | ✅ ninguno | No hay analíticas, publicidad ni session replay |
| Datos del negocio | ⚠️ parcial | Fuente única `mobile/src/config/business.ts`, todos los campos en `[COMPLETAR]` |
| Reembolsos | ✅ no aplica | La app no cobra ni procesa pagos |
| Accesibilidad | ⚠️ parcial | Labels y roles en flujos tocados; contraste de `textMuted` corregido; contraste blanco sobre `primary` sigue < 4.5:1 |
| Reseñas / afirmaciones | ✅ sin hallazgos | 0 testimonios; sin claims de resultados ni de salud en la UI |
| Derechos de autor / IP | ⚠️ parcial | Imágenes generadas con IA rastreadas en la raíz del repo; sin `LICENSE`; ver riesgos |

**Decisión sobre banner de cookies:** no se implementa. La app es React Native: no usa cookies. Solo almacena el token de sesión (almacenamiento seguro del dispositivo, estrictamente necesario) y preferencias de UI (AsyncStorage). El prototipo web de `src/` es solo mockup y no se despliega.

## Cambios realizados

**Backend**
- `backend/app/Http/Controllers/Api/AuthController.php` → `register` exige `accept_terms` (accepted) y, para clientes, `accept_health_data`; guarda `terms_accepted_at`, `terms_version`, `health_data_consent_at`. Nuevo `deleteAccount` (valida contraseña, borra tokens, tokens de reseteo y usuario dentro de transacción; las FK en cascada eliminan el resto).
- `backend/routes/api.php` → `DELETE /v1/account`.
- `backend/database/migrations/2026_09_26_120000_add_consent_columns_to_users_table.php` → columnas nullable de evidencia de consentimiento. **No ejecutada contra Neon** (ver pendientes).
- `backend/config/fitcoach.php` → `legal_version` (`1.0`).
- `backend/tests/Feature/Auth/RegisterTest.php` (+3 tests) y `AccountDeletionTest.php` (5 tests nuevos). Suite completa: 62/62 en verde.

**Mobile**
- `mobile/src/config/business.ts` (nuevo) → datos del titular en un solo lugar, con `[COMPLETAR]`.
- `mobile/src/legal/documents.ts` (nuevo) → Política de Privacidad y Términos, derivados del inventario real de datos.
- `mobile/src/screens/Legal/LegalScreen.tsx` (nuevo) + `RootNavigator.tsx` → ruta `Legal` disponible antes y después de iniciar sesión.
- `mobile/src/screens/Auth/RegisterScreen.tsx` → casillas de consentimiento con enlaces, validación, payload; `accessibilityLabel` en inputs y en el botón mostrar/ocultar contraseña.
- `mobile/src/screens/Profile/SecurityScreen.tsx` → sección "Eliminar cuenta"; labels de accesibilidad.
- `mobile/src/screens/Profile/ProfileScreen.tsx` → entradas "Política de Privacidad" y "Términos y Condiciones".
- `mobile/src/screens/Profile/HelpSupportScreen.tsx` → correo de soporte desde config (antes `soporte@fitcoach.app`, dominio no verificado); FAQ corregida: decía "contraseña temporal", pero el flujo real envía un código de verificación.
- `mobile/src/screens/Planning/SessionBuilderScreen.tsx` → `accessibilityLabel` en los dos botones de subir/reemplazar imagen que solo tenían icono.
- `mobile/src/theme/colors.ts` → `textMuted` de `#64748b` (3.07:1 sobre tarjetas) a `#94a3b8` (5.71:1).
- `mobile/src/services/authService.ts` → `deleteAccount`, campos de consentimiento en `RegisterData`.

**Contenido eliminado:** ninguno.

## Datos recolectados y base legal

| Dato | Finalidad | Obligatorio | Almacenamiento | Terceros |
|---|---|---|---|---|
| Nombre, email, contraseña (hash) | Cuenta y autenticación | Sí | `users` (Neon) | Neon; proveedor de correo (solo email) |
| Rol, género | Funcionalidad por rol; género obligatorio en registro | Sí | `users` | Neon |
| Edad, ocupación, nivel de actividad, objetivo | Personalizar el entrenamiento | No | `user_profiles` | Neon |
| Patologías, lesiones, cirugías, medicamentos, tabaquismo, antecedentes familiares (**salud**) | Que el coach adapte el entrenamiento | No | `medical_histories` | Neon |
| Peso, estatura, cintura, cadera, FC en reposo | Seguimiento de progreso | No | `anthropometrics` | Neon |
| Agua, sueño, calorías, metas de macros | Seguimiento nutricional | No | `nutrition_logs`, `nutrition_settings` | Neon |
| Series (peso, reps, RPE, RIR, notas) | Registro del entrenamiento | No | `workout_executions`, `execution_sets` | Neon |
| Fecha y versión de aceptación de términos; fecha del consentimiento de salud | Evidencia de consentimiento | Sí (generado) | `users` | Neon |
| Token de sesión | Mantener la sesión | Sí | Almacén seguro del dispositivo; `personal_access_tokens` (hash) | — |
| IP y fecha de solicitud | Seguridad / límite de intentos | Sí (técnico) | Logs del servidor | Hosting `[COMPLETAR]` |

**Minimización:** todos los campos de anamnesis y mediciones ya son opcionales. No se elimina ninguna columna. Propuesta (no aplicada): `gender` es obligatorio pero solo se usa para personalización; evaluar hacerlo opcional.

## Terceros detectados

| Servicio | Propósito | Datos | ¿Requiere consentimiento? | Estado |
|---|---|---|---|---|
| Neon (PostgreSQL) | Base de datos | Todos los datos de la app, incluidos los de salud | Cubierto por el consentimiento de tratamiento; transferencia internacional a informar | ⚠️ región `[COMPLETAR]`, revisar DPA |
| Proveedor de correo (`MAIL_MAILER`, no definido en el repo) | Código de recuperación de contraseña | Email + código | No (necesario para el servicio) | ⚠️ `[COMPLETAR]` |
| ngrok (túnel usado en la demo) | Exponer la API local | **Todo el tráfico de la API, incluidos datos de salud** | Sí, si se usa con usuarios reales | ⚠️ solo aceptable para demo; ver riesgos |
| Expo / EAS Build | Compilar el APK | Ninguno de usuarios finales | No | ✅ |
| Analíticas, publicidad, crash reporting | — | — | — | ✅ ninguno |

Resend, SendGrid y PayPal que reporta el escáner son paquetes de `vendor/` (dependencias de framework), no integraciones activas.

## Pendientes que requieren al usuario

1. **Ejecutar la migración** en la base real: `php artisan migrate` (Neon). Sin ella, `register` fallará al guardar el consentimiento. No la ejecuté por ser una base remota compartida.
2. Completar `mobile/src/config/business.ts`: razón social / nombre completo, identificación fiscal, dirección, país, correo de soporte, correo de privacidad, teléfono.
3. Completar en `mobile/src/legal/documents.ts`: región de Neon, proveedor de correo, hosting de la API, plazo de retención de copias de seguridad, autoridad de protección de datos, ley aplicable y jurisdicción.
4. Confirmar jurisdicciones (país del titular y de los usuarios). Si hay usuarios en Colombia: evaluar RNBD y política de tratamiento formal. ⚖️
5. Publicar la política de privacidad en una **URL pública** (Apple y Google Play la exigen) y una URL web de eliminación de cuenta/datos para el formulario Data Safety.
6. Cambiar `com.anonymous.mobile` y `name: "mobile"` en `mobile/app.json` por un identificador y nombre definitivos antes de publicar en tiendas.
7. Decidir si el APK de demo seguirá usando ngrok con usuarios reales (ver riesgos).
8. Decidir el color de acción: `#ffffff` sobre `#3b82f6` da 3.68:1. Opciones: usar `primaryDark` (`#2563eb`, ≈5.2:1) como fondo de botones o dejarlo como excepción justificada.
9. Confirmar la licencia del código (no hay `LICENSE`; el README dice "all rights reserved").
10. Confirmar el origen/licencia de `fitcoach_analytics_dashboard_*.png`, `fitcoach_mockup_gym_*.png`, `fitcoach_tech_architecture_*.png` (raíz), y de las imágenes/GIF del catálogo de ejercicios.

## Riesgos adicionales ⚖️

**Alta**
- **Datos de salud vía ngrok:** el túnel de ngrok procesa el tráfico completo de la API. Para demo con datos ficticios es aceptable; con usuarios reales exige alojar el backend con HTTPS propio y nombrar al proveedor en la política.
- **Cuentas previas sin consentimiento registrado:** los usuarios creados antes de esta versión tienen `terms_accepted_at = NULL`. Sin prueba de consentimiento sobre datos de salud, la base legal es débil. Propuesta: pantalla de re-aceptación en el primer inicio de sesión cuando `terms_version` sea NULL o distinto de la vigente (no implementada).

**Media**
- **Sin verificación de edad:** los términos declaran 18+ pero el registro no lo comprueba. En apps de fitness/salud el riesgo con menores es relevante.
- **Sin exportación de datos:** el derecho de acceso/portabilidad se atiende manualmente por correo.
- **Datos de salud sin cifrado a nivel de aplicación:** dependen del cifrado en reposo del proveedor de base de datos.
- **Mailer por defecto `log`** (`.env.example`): si se mantiene en producción, los códigos de recuperación y correos quedan en `storage/logs` en texto plano.
- **Aviso médico solo en los Términos:** considerar mostrarlo también al iniciar un entrenamiento o al editar metas de nutrición.
- **Coaches con acceso a datos de salud:** el coach ve y edita la anamnesis de sus clientes. Correcto por diseño, pero conviene un aviso al coach de su deber de confidencialidad (términos específicos de coach). ⚖️
- **Imágenes generadas con IA en el repo** y sin origen documentado: la titularidad puede ser limitada según jurisdicción; no se usan en la app, solo están versionadas en la raíz.

**Baja**
- `mobile/.env` está versionado (contiene solo `EXPO_PUBLIC_API_URL`, no un secreto; puede filtrar la URL del túnel). No se cambió porque el build EAS depende de él.
- No hay cambio de idioma (app solo en español): los textos legales están solo en español.
- `vendor/scribe` (documentación de API pública en `backend/public`): confirmar que no queda expuesta en producción.
- Errores preexistentes que no se tocaron: `phpstan analyse` termina con código 1 sin salida (también sin estos cambios), `tsc` falla por opciones de `tsconfig.json`, `SessionBuilderScreen.tsx:309` usa `Colors.error` que no existe en el tema, y ESLint reporta cientos de errores de fin de línea (CRLF) en varios archivos.
- El prototipo web `src/` (Figma/shadcn) marca patrones de foco eliminado y no fue auditado: es solo mockup.
