<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Program;
use App\Models\CoachClient;

class ProgramController extends Controller
{
    /**
     * @group Coach - Planificación
     * Crear un nuevo programa
     */
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:users,id',
            'name' => 'required|string|max:100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);
        
        $assignment = CoachClient::where('coach_id', $request->user()->id)
            ->where('client_id', $request->client_id)->first();
            
        if (!$assignment) {
            return response()->json(['message' => 'Client not assigned to you'], 403);
        }

        $program = Program::create([
            'coach_id' => $request->user()->id,
            'client_id' => $request->client_id,
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'active'
        ]);

        return response()->json($program, 201);
    }

    /**
     * @group Coach - Planificación
     * Listar programas de un alumno
     */
    public function indexByClient(Request $request, $clientId)
    {
        $assignment = CoachClient::where('coach_id', $request->user()->id)
            ->where('client_id', $clientId)->first();
            
        if (!$assignment) {
            return response()->json(['message' => 'Client not assigned to you'], 403);
        }
        
        $programs = Program::where('client_id', $clientId)->with('mesocycles.microcycles')->get();
        return response()->json($programs);
    }
}
