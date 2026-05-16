# Skill: DevSecOps Validator

## Triggers (Disparadores)

- Al completar una funcionalidad o antes de preparar un commit de Git.

## Flujo de Trabajo Autónomo

1. **Escaneo de Dependencias**: Navegar a los directorios correspondientes y ejecutar auditorías de vulnerabilidades conocidas:
   - Backend: `composer audit`
   - Frontend (React Native): `pnpm audit --audit-level=high` (Desde la raíz del monorepo).
2. **Análisis de Fugas**: Escanear los archivos modificados buscando patrones que coincidan con contraseñas, tokens JWT o claves privadas expuestas (Validar usando Gitleaks).
3. **Verificación de Logs**: Confirmar que no se hayan introducido funciones `Log::info()` o `dd()` que expongan contraseñas o datos biométricos de los clientes.
4. **Validación de Mass Assignment y Entradas**: 
   - Confirmar que todos los modelos de Laravel definan correctamente `$fillable` o `$guarded`.
   - Asegurar que todos los endpoints utilicen _Form Requests_ para sanitización y validación estricta de variables antes de persistir a base de datos.

## Acción ante Fallos

Si se detecta una vulnerabilidad o un incumplimiento de regla, el agente detendrá el ciclo de desarrollo actual, solicitará corrección y presentará un bloque de refactorización automática para corregir el fallo de seguridad.
