<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\WorkoutExecutionResource;
use App\Http\Resources\WorkoutSessionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Models\Program;
use App\Models\WorkoutSession;
use App\Models\WorkoutExecution;
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
            // response()->json(null) serializa a "{}", no a "null" (Symfony
            // sustituye un $data null por un ArrayObject vacío). Se usa
            // fromJsonString para devolver el literal JSON null real.
            return JsonResponse::fromJsonString('null');
        }

        return new ProgramResource($program);
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

        return new WorkoutSessionResource($session);
    }

    /**
     * @group Alumno - Entrenamiento
     * Guardar ejecución de rutina
     */
    public function storeExecution(Request $request)
    {
        $request->validate([
            'workout_session_id' => 'required|exists:workout_sessions,id',
            'session_rpe' => 'nullable|integer|between:1,10',
            'notes' => 'nullable|string|max:2000',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
            'sets' => 'required|array|min:1',
            'sets.*.exercise_id' => 'required|exists:exercises,id',
            'sets.*.set_number' => 'required|integer|min:1',
            'sets.*.weight_kg' => 'nullable|numeric|min:0|max:1000',
            'sets.*.reps_performed' => 'nullable|integer|min:0|max:500',
            'sets.*.rpe' => 'nullable|integer|between:1,10',
            'sets.*.rir' => 'nullable|integer|between:0,10',
            'sets.*.notes' => 'nullable|string|max:1000',
        ]);

        // Verify ownership (404 si la sesión no pertenece a un programa del cliente)
        WorkoutSession::whereHas('microcycle.mesocycle.program', function($q) use ($request) {
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

            // Inserción en bloque: una sesión típica trae 20-40 series.
            $exec->executionSets()->createMany(
                collect($request->sets)->map(fn ($setData) => [
                    'exercise_id' => $setData['exercise_id'],
                    'set_number' => $setData['set_number'],
                    'weight_kg' => $setData['weight_kg'] ?? null,
                    'reps_performed' => $setData['reps_performed'] ?? null,
                    'rpe' => $setData['rpe'] ?? null,
                    'rir' => $setData['rir'] ?? null,
                    'notes' => $setData['notes'] ?? null,
                ])->all()
            );

            return $exec->load('executionSets.exercise');
        });

        return (new WorkoutExecutionResource($execution))
            ->response()
            ->setStatusCode(201);
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
            ->paginate($request->integer('per_page', 20));

        return WorkoutExecutionResource::collection($executions);
    }
}
