<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\CoachClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Relación coach ↔ cliente. Los checks de rol los aplica el middleware
 * 'role:coach' / 'role:client' definido en routes/api.php.
 */
class CoachController extends Controller
{
    /**
     * Get all clients that do not have a coach assigned yet.
     */
    public function getAvailableClients()
    {
        $availableClients = User::where('role', 'client')
            ->whereDoesntHave('coachAssignment')
            ->get();

        return UserResource::collection($availableClients);
    }

    /**
     * Coach assigns a client to themselves.
     */
    public function assignClient(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:users,id'
        ]);

        $client = User::findOrFail($request->client_id);

        if ($client->role !== 'client') {
            return response()->json(['error' => 'El usuario indicado no es un asesorado.'], 422);
        }

        if ($client->coachAssignment()->exists()) {
            return response()->json(['error' => 'El alumno ya tiene un coach asignado.'], 400);
        }

        $assignment = CoachClient::create([
            'coach_id' => $request->user()->id,
            'client_id' => $client->id,
        ]);

        return response()->json([
            'message' => 'Alumno asignado con éxito',
            'data' => $assignment
        ], 201);
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
