# Despliegue de la API

La app móvil es un APK; solo hay que alojar `backend/` (Laravel 13 / PHP 8.3). La base de datos ya vive en Neon.

## Requisitos del host
- Docker (usa `backend/Dockerfile`) **o** PHP 8.3 + `pdo_pgsql` + OPcache.
- Proceso persistente (no serverless). Puerto vía `$PORT`.
- Almacenamiento de objetos para las imágenes de ejercicios: el disco local se borra en cada deploy. Configurado para Cloudflare R2 (`EXERCISE_MEDIA_DISK=r2`).

## Pasos (Railway / Render / Fly con Docker)
1. Crea el servicio apuntando a `backend/` (Dockerfile incluido).
2. Copia las variables de `backend/.env.production.example` al panel del host y complétalas.
   - `APP_KEY`: `php artisan key:generate --show`.
   - `DB_HOST`: usa el host `-pooler` de Neon y la **misma región** que el host de la API.
3. Crea el bucket R2, habilita su dominio público y rellena `R2_*`.
4. Primer arranque: `RUN_MIGRATIONS=true`, y quítalo después. (O ejecuta `php artisan migrate --force` como paso aparte.)
5. Verifica `GET https://<tu-api>/up` → 200.
6. Reconstruye el APK con la URL real: `EXPO_PUBLIC_API_URL=https://<tu-api>/api/v1` en `mobile/.env` y `eas build --platform android --profile preview`.

## Qué ya está optimizado
- Sin sesiones/colas/cache en BD (`SESSION_DRIVER=array`, `QUEUE_CONNECTION=sync`, `CACHE_STORE=file`).
- `config`, `route`, `event` y `view` cacheados al arrancar; OPcache sin revalidación; autoloader optimizado; `--no-dev`.
- Logs a `stderr` con nivel `warning`.
- `TRUSTED_PROXIES` para que las URLs salgan en https tras el proxy del host.

## Neon (escala a cero)
La primera petición tras inactividad tarda ~1 s más mientras la base "despierta". Aceptable para demo; en producción desactiva el *scale to zero* del proyecto o mantén un ping a `/up`.

## Sin verificar en esta sesión
El `Dockerfile` no se construyó localmente (Docker no está instalado en esta máquina) y la subida a R2 se probó solo con un disco simulado. Haz un primer deploy de prueba antes de apuntar el APK.
