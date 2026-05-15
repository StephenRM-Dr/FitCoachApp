<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\WorkoutSession;
use App\Models\Microcycle;
use App\Models\SessionExercise;
use Illuminate\Support\Facades\DB;

class WorkoutSessionController extends Controller
{
    /**
     * @group Coach - Planificación
     * Crear sesión de entrenamiento
     * @urlParam microcycleId integer required The ID of the microcycle.
     */
    public function store(Request $request, $microcycleId)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'day_of_week' => 'nullable|string|max:20',
            'exercises' => 'required|array',
            'exercises.*.exercise_id' => 'required|exists:exercises,id',
            'exercises.*.target_sets' => 'nullable|integer',
            'exercises.*.target_reps' => 'nullable|integer',
            'exercises.*.target_rpe' => 'nullable|integer',
            'exercises.*.rest_time_seconds' => 'nullable|integer',
        ]);
        
        $microcycle = Microcycle::with('mesocycle.program')->findOrFail($microcycleId);
        if ($microcycle->mesocycle->program->coach_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $session = DB::transaction(function () use ($request, $microcycle) {
            $session = WorkoutSession::create([
                'microcycle_id' => $microcycle->id,
                'name' => $request->name,
                'day_of_week' => $request->day_of_week,
            ]);
            
            $order = 1;
            foreach ($request->exercises as $exData) {
                SessionExercise::create([
                    'workout_session_id' => $session->id,
                    'exercise_id' => $exData['exercise_id'],
                    'order' => $order++,
                    'target_sets' => $exData['target_sets'] ?? null,
                    'target_reps' => $exData['target_reps'] ?? null,
                    'target_rpe' => $exData['target_rpe'] ?? null,
                    'rest_time_seconds' => $exData['rest_time_seconds'] ?? null,
                ]);
            }
            return $session->load('sessionExercises.exercise');
        });
        
        return response()->json($session, 201);
    }
}
