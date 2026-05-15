<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Resuelve el ID del usuario objetivo.
     * Si el usuario es cliente, devuelve su propio ID.
     * Si el usuario es coach y envía client_id, verifica permisos y devuelve ese ID.
     */
    protected function getTargetUserId(\Illuminate\Http\Request $request)
    {
        $user = $request->user();

        if ($user && $user->role === 'coach' && $request->has('client_id')) {
            $clientId = $request->input('client_id');
            
            // Verificar que el coach tiene asignado a este cliente
            $hasAccess = \App\Models\CoachClient::where('coach_id', $user->id)
                ->where('client_id', $clientId)
                ->exists();
                
            if (!$hasAccess) {
                abort(403, 'No tienes acceso a los datos de este alumno.');
            }
            
            return $clientId;
        }

        return $user ? $user->id : null;
    }
}
