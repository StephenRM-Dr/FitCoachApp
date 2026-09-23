<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Restringe la ruta a usuarios con el rol indicado.
     *
     * Uso: ->middleware('role:coach') o ->middleware('role:client')
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user() || $request->user()->role !== $role) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return $next($request);
    }
}
