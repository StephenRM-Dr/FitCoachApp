<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use Illuminate\Http\Request;

use App\Models\Program;

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

        $this->authorizeCoachOwnsClient($request, (int) $request->client_id);

        $program = Program::create([
            'coach_id' => $request->user()->id,
            'client_id' => $request->client_id,
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'active'
        ]);

        return (new ProgramResource($program))->response()->setStatusCode(201);
    }

    /**
     * @group Coach - Planificación
     * Listar programas de un alumno
     */
    public function indexByClient(Request $request, $clientId)
    {
        $this->authorizeCoachOwnsClient($request, (int) $clientId);

        // Solo la estructura y el número de ejercicios por sesión: el árbol
        // completo con cada ejercicio crecía con cada semana planificada, y el
        // detalle de una sesión se pide aparte (coach/sessions/{id}).
        $programs = Program::where('client_id', $clientId)
            ->with([
                'mesocycles' => fn ($q) => $q->orderBy('start_week'),
                'mesocycles.microcycles' => fn ($q) => $q->orderBy('week_number'),
                'mesocycles.microcycles.workoutSessions' => fn ($q) => $q->withCount('sessionExercises'),
            ])
            ->get();

        return ProgramResource::collection($programs);
    }
}
