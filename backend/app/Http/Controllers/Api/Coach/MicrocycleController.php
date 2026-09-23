<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\MicrocycleResource;
use Illuminate\Http\Request;

use App\Models\Microcycle;
use App\Models\Mesocycle;

class MicrocycleController extends Controller
{
    /**
     * @group Coach - Planificación
     * Añadir una semana (microciclo)
     * @urlParam mesocycleId integer required The ID of the mesocycle.
     */
    public function store(Request $request, $mesocycleId)
    {
        $request->validate([
            'week_number' => 'required|integer',
            'focus' => 'nullable|string|max:100',
        ]);

        $mesocycle = Mesocycle::with('program')->findOrFail($mesocycleId);
        if ($mesocycle->program->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a este mesociclo.'], 403);
        }

        $microcycle = Microcycle::create([
            'mesocycle_id' => $mesocycle->id,
            'week_number' => $request->week_number,
            'focus' => $request->focus,
        ]);

        return (new MicrocycleResource($microcycle))->response()->setStatusCode(201);
    }

    /**
     * @group Coach - Planificación
     * Lista liviana (sin sesiones) de las semanas de un mesociclo, para
     * navegación — p. ej. las flechas ‹ › de PlanningScreen.
     * @urlParam mesocycleId integer required The ID of the mesocycle.
     */
    public function index(Request $request, $mesocycleId)
    {
        $mesocycle = Mesocycle::with('program')->findOrFail($mesocycleId);
        if ($mesocycle->program->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a este mesociclo.'], 403);
        }

        $microcycles = Microcycle::where('mesocycle_id', $mesocycle->id)
            ->orderBy('week_number')
            ->get();

        return MicrocycleResource::collection($microcycles);
    }

    /**
     * @group Coach - Planificación
     * Detalle de un microciclo específico, con sus sesiones — para ver o
     * seguir planificando una semana anterior.
     * @urlParam microcycleId integer required The ID of the microcycle.
     */
    public function show(Request $request, $microcycleId)
    {
        $microcycle = Microcycle::with('mesocycle.program')->findOrFail($microcycleId);
        if ($microcycle->mesocycle->program->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a este microciclo.'], 403);
        }

        $microcycle->load('workoutSessions.sessionExercises.exercise');

        return new MicrocycleResource($microcycle);
    }

    /**
     * @group Coach - Planificación
     * Detalle de una semana por su número, con sus sesiones — usado por la
     * paginación de PlanningScreen para pedir solo la semana a la que se
     * navega, sin traer antes el listado completo del mesociclo.
     * @urlParam mesocycleId integer required The ID of the mesocycle.
     * @urlParam weekNumber integer required The week_number to look up.
     */
    public function showByWeek(Request $request, $mesocycleId, $weekNumber)
    {
        $mesocycle = Mesocycle::with('program')->findOrFail($mesocycleId);
        if ($mesocycle->program->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a este mesociclo.'], 403);
        }

        $microcycle = Microcycle::where('mesocycle_id', $mesocycle->id)
            ->where('week_number', $weekNumber)
            ->firstOrFail();

        $microcycle->load('workoutSessions.sessionExercises.exercise');

        return new MicrocycleResource($microcycle);
    }
}
