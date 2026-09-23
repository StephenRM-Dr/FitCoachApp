<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkoutSessionResource;

use App\Models\WorkoutSession;
use App\Models\Microcycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\Api\Coach\StoreWorkoutSessionRequest;

class WorkoutSessionController extends Controller
{
    /**
     * @group Coach - Planificación
     * Crear sesión de entrenamiento
     * @urlParam microcycleId integer required The ID of the microcycle.
     */
    public function store(StoreWorkoutSessionRequest $request, $microcycleId)
    {
        $validated = $request->validated();
        
        $microcycle = Microcycle::with('mesocycle.program')->findOrFail($microcycleId);
        if ($microcycle->mesocycle->program->coach_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $session = DB::transaction(function () use ($validated, $microcycle) {
            $session = WorkoutSession::create([
                'microcycle_id' => $microcycle->id,
                'name' => $validated['name'],
                'day_of_week' => $validated['day_of_week'],
            ]);
            
            $session->sessionExercises()->createMany(
                collect($validated['exercises'])->values()->map(fn ($exData, $index) => [
                    'exercise_id' => $exData['exercise_id'],
                    'order' => $index + 1,
                    'target_sets' => $exData['target_sets'] ?? null,
                    'target_reps' => $exData['target_reps'] ?? null,
                    'target_rpe' => $exData['target_rpe'] ?? null,
                    'rest_time_seconds' => $exData['rest_time_seconds'] ?? null,
                ])->all()
            );

            return $session->load('sessionExercises.exercise');
        });
        
        return (new WorkoutSessionResource($session))->response()->setStatusCode(201);
    }

    /**
     * @group Coach - Planificación
     * Ver detalle de una sesión (solo lectura)
     * @urlParam sessionId integer required The ID of the session.
     */
    public function show(Request $request, $sessionId)
    {
        $session = WorkoutSession::with('sessionExercises.exercise')
            ->whereHas('microcycle.mesocycle.program', function ($q) use ($request) {
                $q->where('coach_id', $request->user()->id);
            })
            ->findOrFail($sessionId);

        return new WorkoutSessionResource($session);
    }

    /**
     * @group Coach - Planificación
     * Editar una sesión ya guardada: renombrarla, cambiar su día, o
     * añadir/quitar ejercicios. Reemplaza la lista completa de ejercicios
     * de la sesión por la que llega en el request.
     * @urlParam sessionId integer required The ID of the session.
     */
    public function update(StoreWorkoutSessionRequest $request, $sessionId)
    {
        $validated = $request->validated();

        $session = WorkoutSession::with('microcycle.mesocycle.program')->findOrFail($sessionId);
        if ($session->microcycle->mesocycle->program->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a esta sesión.'], 403);
        }

        $session = DB::transaction(function () use ($validated, $session) {
            $session->update([
                'name' => $validated['name'],
                'day_of_week' => $validated['day_of_week'],
            ]);

            $session->sessionExercises()->delete();
            $session->sessionExercises()->createMany(
                collect($validated['exercises'])->values()->map(fn ($exData, $index) => [
                    'exercise_id' => $exData['exercise_id'],
                    'order' => $index + 1,
                    'target_sets' => $exData['target_sets'] ?? null,
                    'target_reps' => $exData['target_reps'] ?? null,
                    'target_rpe' => $exData['target_rpe'] ?? null,
                    'rest_time_seconds' => $exData['rest_time_seconds'] ?? null,
                ])->all()
            );

            return $session->fresh('sessionExercises.exercise');
        });

        return new WorkoutSessionResource($session);
    }
}
