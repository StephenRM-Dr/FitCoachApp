<?php

namespace App\Http\Controllers;

use App\Models\CoachClient;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Aborta con 403 si el coach autenticado no tiene asignado a $clientId.
     * Único punto de verdad para este check — reusado por cada endpoint de
     * coach que opera sobre "un alumno mío" en vez de sus propios datos.
     */
    protected function authorizeCoachOwnsClient(Request $request, int $clientId): void
    {
        if (! CoachClient::isAssigned($request->user()->id, $clientId)) {
            abort(403, 'No tienes acceso a los datos de este alumno.');
        }
    }

    /**
     * Resuelve el ID del usuario objetivo.
     * Si el usuario es cliente, devuelve su propio ID.
     * Si el usuario es coach y envía client_id, verifica permisos y devuelve ese ID.
     */
    protected function getTargetUserId(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role === 'coach' && $request->has('client_id')) {
            $clientId = (int) $request->input('client_id');

            $this->authorizeCoachOwnsClient($request, $clientId);

            return $clientId;
        }

        return $user ? $user->id : null;
    }
}
