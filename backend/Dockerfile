# Imagen de producción de la API (FitCoach Pro).
# FrankenPHP = Caddy + PHP en un solo proceso, con OPcache; el TLS lo termina
# la plataforma (Railway/Render/Fly), por eso se sirve HTTP en $PORT.

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist \
    --no-interaction --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    --no-scripts --ignore-platform-reqs

FROM dunglas/frankenphp:1-php8.3-alpine
RUN install-php-extensions pdo_pgsql opcache intl

WORKDIR /app
COPY --from=vendor /app /app
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-fitcoach.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache storage/framework/views storage/logs bootstrap/cache \
    && chmod -R ug+rw storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
