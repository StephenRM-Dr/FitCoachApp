#!/bin/sh
set -e

# El puerto lo inyecta la plataforma (Railway/Render/Fly); TLS lo termina ella.
export SERVER_NAME=":${PORT:-8080}"

# Comandos puntuales (p. ej. el pre-deploy de Railway: `php artisan migrate --force`):
# se ejecutan tal cual, sin arrancar el servidor. `sh -c` admite que la
# plataforma pase el comando como un solo argumento o como varios.
if [ "$#" -gt 0 ]; then
    exec sh -c "$*"
fi

# Las cachés se generan en runtime, cuando ya existen las variables de entorno.
php artisan package:discover --ansi
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache

# Migraciones opt-in: con varias instancias conviene correrlas como paso aparte.
if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force
fi

exec frankenphp run --config /etc/caddy/Caddyfile --adapter caddyfile
