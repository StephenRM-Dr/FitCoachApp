# Despliegue de la API en Railway

La app móvil es un APK; solo se aloja `backend/` (Laravel 13 / PHP 8.3). La base de datos sigue en Neon y las imágenes de ejercicios en Cloudflare R2.

Archivos que ya lo preparan: `backend/Dockerfile`, `backend/railway.json`, `backend/docker/`, `backend/.env.production.example`.

## 1. Cloudflare R2 (imágenes)
El disco local de Railway se borra en cada deploy; sin R2 las imágenes subidas desaparecen.
1. Cloudflare → R2 → crea el bucket `fitcoach-media`.
2. Bucket → Settings → **Public access**: conecta un dominio propio o activa el dominio `r2.dev`. Esa URL es `R2_PUBLIC_URL`.
3. R2 → Manage API tokens → crea un token con permiso *Object Read & Write* sobre ese bucket. Guarda Access Key ID y Secret.
4. `R2_ENDPOINT` = `https://<account-id>.r2.cloudflarestorage.com`.

## 2. Railway
1. Sube el código a GitHub (rama que vayas a desplegar).
2. Railway → New Project → *Deploy from GitHub repo* → elige el repo.
3. Servicio → Settings → **Root Directory**: `/backend`. Railway detecta el `Dockerfile` y lee `railway.json`.
4. Servicio → Variables → *Raw Editor* → pega `backend/.env.production.example` y complétalo:
   - `APP_KEY`: ejecuta `php artisan key:generate --show` en local y pega el resultado.
   - `APP_URL`: el dominio de Railway (paso 5).
   - `DB_*`: los de Neon. Usa el host `-pooler` y la **misma región** que el servicio de Railway (Settings → Region).
   - `R2_*` y `EXERCISE_MEDIA_DISK=r2`.
   - Correo real (`MAIL_*`): sin él los códigos de recuperación de contraseña quedan solo en los logs.
   - `COACH_REGISTRATION_CODE`: el código de invitación de coaches.
5. Settings → Networking → **Generate Domain**. Copia la URL y ponla en `APP_URL`.
6. Deploy. El pre-deploy corre `php artisan migrate --force` y el healthcheck consulta `/up`.

## 3. Verificación
- `GET https://<tu-dominio>/up` → 200.
- `POST https://<tu-dominio>/api/v1/login` con credenciales inválidas → 422 (no 500).
- Como coach, sube una imagen a un ejercicio: la respuesta trae `image_url` con la URL de R2 y se ve en el navegador.

## 4. Apuntar la app
En `mobile/.env`: `EXPO_PUBLIC_API_URL=https://<tu-dominio>/api/v1` y reconstruye el APK: `eas build --platform android --profile preview`. Ya no hace falta ngrok.

## Consumo
- Un solo servicio, sin base de datos de Railway (Neon) ni Redis: el costo es el del servicio web.
- Deja *Serverless / App Sleeping* apagado: reactivar el contenedor sumado al despertar de Neon hace lenta la primera petición.
- Logs a `stderr` con nivel `warning`: no llenan disco ni cuota.
- Las cachés de config/rutas/vistas y OPcache se activan solas en cada arranque.

## Neon (escala a cero)
La primera petición tras inactividad tarda ~1 s más mientras la base "despierta". Para demo es aceptable; con usuarios reales desactiva *scale to zero* en el proyecto de Neon.

## Problemas conocidos
- **Local en Windows: la subida de imagen falla o la imagen queda vacía.** Si el log dice `cURL error 60: SSL certificate problem`, tu PHP no tiene un bundle de CA. Define `R2_CA_BUNDLE=C:/laragon/etc/ssl/cacert.pem` en `backend/.env` (o `curl.cainfo` y `openssl.cafile` en `php.ini`) y reinicia `php artisan serve`. En Railway (Linux) no hace falta.

## Sin verificar
El `Dockerfile` no se ha construido ni ejecutado (Docker no está instalado en la máquina de desarrollo) y R2 solo se probó con un disco simulado. Revisa los logs de build y del primer arranque en Railway antes de reconstruir el APK.
