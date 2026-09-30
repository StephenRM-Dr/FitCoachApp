<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\CoachClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Relación coach ↔ cliente. Los checks de rol los aplica el middleware
 * 'role:coach' / 'role:client' definido en routes/api.php.
 */
class CoachController extends Controller
{
    /**
     * @group Coach - Asesorados
     * El coach crea la cuenta de su asesorado y queda asignado a él. La
     * contraseña que escribe es temporal: al primer ingreso el asesorado
     * debe cambiarla (force_password_change) y aceptar él mismo los términos
     * y el tratamiento de sus datos de salud (terms_accepted_at queda null),
     * porque ese consentimiento no lo puede dar el coach.
     */
    public function createClient(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'gender' => 'required|in:male,female',
            'password' => 'required|string|min:8',
        ]);

        $client = DB::transaction(function () use ($validated, $request) {
            $client = User::create([...$validated, 'role' => 'client']);
            $client->forceFill(['force_password_change' => true])->save();

            CoachClient::create([
                'coach_id' => $request->user()->id,
                'client_id' => $client->id,
            ]);

            return $client;
        });

        return (new UserResource($client))->response()->setStatusCode(201);
    }

    /**
     * @group Coach - Asesorados
     * Asigna una nueva contraseña temporal a un asesorado propio (no hay
     * recuperación por correo). Cierra sus sesiones abiertas y le obliga a
     * cambiarla al volver a entrar.
     */
    public function resetClientPassword(Request $request, User $client)
    {
        $ownsClient = CoachClient::where('coach_id', $request->user()->id)
            ->where('client_id', $client->id)
            ->exists();

        if (! $ownsClient) {
            return response()->json(['message' => 'No tienes acceso a este asesorado.'], 403);
        }

        $request->validate(['password' => 'required|string|min:8']);

        $client->password = $request->password;
        $client->force_password_change = true;
        $client->save();
        $client->tokens()->delete();

        return response()->json(['message' => 'Contraseña temporal actualizada.']);
    }

    /**
     * Coach gets the list of their clients.
     */
    public function getMyClients(Request $request)
    {
        $clients = User::whereHas('coachAssignment', function ($query) use ($request) {
            $query->where('coach_id', $request->user()->id);
        })->get();

        return UserResource::collection($clients);
    }

    /**
     * Client gets their assigned coach.
     */
    public function getMyCoach(Request $request)
    {
        $assignment = $request->user()->coachAssignment()->with('coach')->first();

        if (!$assignment) {
            // response()->json(null) serializa a "{}", no a "null" (Symfony
            // sustituye un $data null por un ArrayObject vacío). Se usa
            // fromJsonString para devolver el literal JSON null real.
            return JsonResponse::fromJsonString('null');
        }

        return new UserResource($assignment->coach);
    }
}
