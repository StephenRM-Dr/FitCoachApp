<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\MicrocycleResource;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;

class WeeklyPlanController extends Controller
{
    /**
     * @group Coach - Planificación
     * Provisiona (si hace falta) y devuelve la semana actual de trabajo de
     * un alumno: Programa activo → Mesociclo → Microciclo con `week_number`
     * más alto. Operación idempotente — llamarla varias veces no duplica
     * nada, solo crea lo que falte la primera vez.
     */
    public function ensureCurrent(Request $request, $clientId)
    {
        $this->authorizeCoachOwnsClient($request, (int) $clientId);

        $program = Program::where('coach_id', $request->user()->id)
            ->where('client_id', $clientId)
            ->where('status', 'active')
            ->first();

        if (! $program) {
            $client = User::findOrFail($clientId);
            $program = Program::create([
                'coach_id' => $request->user()->id,
                'client_id' => $clientId,
                'name' => 'Plan de entrenamiento de '.$client->name,
                'status' => 'active',
            ]);
        }

        $mesocycle = Mesocycle::where('program_id', $program->id)
            ->orderByDesc('start_week')
            ->first();

        if (! $mesocycle) {
            $mesocycle = Mesocycle::create([
                'program_id' => $program->id,
                'name' => 'Mesociclo 1',
                'start_week' => 1,
                'end_week' => 4,
            ]);
        }

        $microcycle = Microcycle::where('mesocycle_id', $mesocycle->id)
            ->orderByDesc('week_number')
            ->first();

        if (! $microcycle) {
            $microcycle = Microcycle::create([
                'mesocycle_id' => $mesocycle->id,
                'week_number' => 1,
            ]);
        }

        $microcycle->load('workoutSessions.sessionExercises.exercise');

        return response()->json([
            'program_id' => $program->id,
            'mesocycle_id' => $mesocycle->id,
            'microcycle' => new MicrocycleResource($microcycle),
        ]);
    }
}
