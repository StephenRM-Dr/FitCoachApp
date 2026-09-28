<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkoutSessionResource;

use App\Models\WorkoutSession;
use App\Models\Microcycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        
        $this->ensureDayIsFree($microcycle->id, $validated['day_of_week'] ?? null);

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

        $this->ensureDayIsFree($session->microcycle_id, $validated['day_of_week'] ?? null, $session->id);

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

    /**
     * Una semana admite una sola sesión por día: el plan semanal del coach y
     * la vista del asesorado se organizan por día, y una segunda sesión el
     * mismo día quedaba oculta para el coach pero visible para el asesorado.
     * Las sesiones sin día (flexibles) no tienen límite.
     */
    private function ensureDayIsFree(int $microcycleId, ?string $day, ?int $exceptSessionId = null): void
    {
        if ($day === null) {
            return;
        }

        $taken = WorkoutSession::where('microcycle_id', $microcycleId)
            ->where('day_of_week', $day)
            ->when($exceptSessionId, fn ($q) => $q->where('id', '!=', $exceptSessionId))
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages([
                'day_of_week' => ['Ya hay una sesión planificada para ese día. Edítala en lugar de crear otra.'],
            ]);
        }
    }
}
