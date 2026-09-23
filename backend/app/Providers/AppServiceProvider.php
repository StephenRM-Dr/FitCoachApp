<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Los clientes de la API (app móvil) esperan objetos/arrays planos,
        // sin el envoltorio {"data": ...} que los Resources añaden por defecto.
        JsonResource::withoutWrapping();
    }
}
