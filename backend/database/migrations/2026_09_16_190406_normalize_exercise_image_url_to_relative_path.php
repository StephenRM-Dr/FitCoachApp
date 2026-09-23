<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Antes de este cambio, image_url se guardaba como URL absoluta armada con
 * APP_URL (p. ej. http://127.0.0.1:8000/storage/exercises/x.gif), que no es
 * alcanzable desde un dispositivo real detrás de un túnel ngrok o IP de LAN.
 * Ahora se guarda solo la ruta relativa y ExerciseResource arma la URL
 * absoluta a partir del host de cada request. Esta migración normaliza los
 * valores ya guardados para que las imágenes subidas antes del fix se vean
 * sin necesidad de volver a subirlas.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('exercises')
            ->whereNotNull('image_url')
            ->get(['id', 'image_url'])
            ->each(function ($exercise) {
                $url = $exercise->image_url;
                if (str_contains($url, '/storage/')) {
                    DB::table('exercises')
                        ->where('id', $exercise->id)
                        ->update(['image_url' => Str::after($url, '/storage/')]);
                }
            });
    }

    public function down(): void
    {
        // Normalización de datos irreversible (no se conserva el host original).
    }
};
