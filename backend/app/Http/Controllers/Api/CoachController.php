<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CoachClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CoachController extends Controller
{
    /**
     * Get all clients that do not have a coach assigned yet.
     */
    public function getAvailableClients()
    {
        $assignedClientIds = CoachClient::pluck('client_id')->toArray();
        $availableClients = User::where('role', 'client')
            ->whereNotIn('id', $assignedClientIds)
            ->get();

        return response()->json($availableClients);
    }

    /**
     * Coach assigns a client to themselves.
     */
    public function assignClient(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:users,id'
        ]);

        $clientId = $request->client_id;
        $coachId = $request->user()->id;

        // Check if user is actually a coach
        if ($request->user()->role !== 'coach') {
            return response()->json(['error' => 'Solo los coaches pueden asignar alumnos.'], 403);
        }

        // Check if client is already assigned
        if (CoachClient::where('client_id', $clientId)->exists()) {
            return response()->json(['error' => 'El alumno ya tiene un coach asignado.'], 400);
        }

        $assignment = CoachClient::create([
            'coach_id' => $coachId,
            'client_id' => $clientId
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
        if ($request->user()->role !== 'coach') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $clients = User::whereIn('id', function($query) use ($request) {
            $query->select('client_id')
                  ->from('coach_clients')
                  ->where('coach_id', $request->user()->id);
        })->get();

        return response()->json($clients);
    }

    /**
     * Client gets their assigned coach.
     */
    public function getMyCoach(Request $request)
    {
        if ($request->user()->role !== 'client') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $assignment = CoachClient::where('client_id', $request->user()->id)->with('coach')->first();

        if (!$assignment) {
            return response()->json(null);
        }

        return response()->json($assignment->coach);
    }
}
