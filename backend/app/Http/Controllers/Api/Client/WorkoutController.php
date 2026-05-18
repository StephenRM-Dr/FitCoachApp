<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Program;
use App\Models\WorkoutSession;
use App\Models\WorkoutExecution;
use App\Models\ExecutionSet;
use Illuminate\Support\Facades\DB;

class WorkoutController extends Controller
{
    /**
     * @group Alumno - Entrenamiento
     * Obtener programa activo
     */
    public function activeProgram(Request $request)
    {
        $program = Program::where('client_id', $request->user()->id)
            ->where('status', 'active')
            ->with('mesocycles.microcycles.workoutSessions.sessionExercises.exercise')
            ->first();
            
        if (!$program) {
            return response()->json(null, 200);
        }
        
        return response()->json($program);
    }

    /**
     * @group Alumno - Entrenamiento
     * Obtener sesión de hoy
     * @urlParam sessionId integer required The ID of the session.
     */
    public function getSession(Request $request, $sessionId)
    {
        $session = WorkoutSession::with('sessionExercises.exercise')
            ->whereHas('microcycle.mesocycle.program', function($q) use ($request) {
                $q->where('client_id', $request->user()->id);
            })
            ->findOrFail($sessionId);
            
        return response()->json($session);
    }

    /**
     * @group Alumno - Entrenamiento
     * Guardar ejecución de rutina
     */
    public function storeExecution(Request $request)
    {
        $request->validate([
            'workout_session_id' => 'required|exists:workout_sessions,id',
            'session_rpe' => 'nullable|integer',
            'notes' => 'nullable|string',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'sets' => 'required|array',
            'sets.*.exercise_id' => 'required|exists:exercises,id',
            'sets.*.set_number' => 'required|integer',
            'sets.*.weight_kg' => 'nullable|numeric',
            'sets.*.reps_performed' => 'nullable|integer',
            'sets.*.rpe' => 'nullable|integer',
            'sets.*.rir' => 'nullable|integer',
        ]);
        
        // Verify ownership
        $session = WorkoutSession::whereHas('microcycle.mesocycle.program', function($q) use ($request) {
            $q->where('client_id', $request->user()->id);
        })->findOrFail($request->workout_session_id);

        $execution = DB::transaction(function () use ($request) {
            $exec = WorkoutExecution::create([
                'workout_session_id' => $request->workout_session_id,
                'user_id' => $request->user()->id,
                'started_at' => $request->started_at ?? now(),
                'completed_at' => $request->completed_at ?? now(),
                'session_rpe' => $request->session_rpe,
                'notes' => $request->notes,
            ]);

            foreach ($request->sets as $setData) {
                ExecutionSet::create([
                    'workout_execution_id' => $exec->id,
                    'exercise_id' => $setData['exercise_id'],
                    'set_number' => $setData['set_number'],
                    'weight_kg' => $setData['weight_kg'] ?? null,
                    'reps_performed' => $setData['reps_performed'] ?? null,
                    'rpe' => $setData['rpe'] ?? null,
                    'rir' => $setData['rir'] ?? null,
                ]);
            }
            return $exec->load('executionSets.exercise');
        });

        return response()->json($execution, 201);
    }

    /**
     * @group Alumno - Entrenamiento
     * Historial de ejecuciones
     */
    public function history(Request $request)
    {
        $executions = WorkoutExecution::where('user_id', $request->user()->id)
            ->with(['workoutSession', 'executionSets.exercise'])
            ->orderBy('completed_at', 'desc')
            ->get();
            
        return response()->json($executions);
    }
}
