<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkoutLog;
use App\Services\TextCleaner;
use Illuminate\Http\Request;

class WorkoutLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        return response()->json(WorkoutLog::where('user_id', $userId)->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exercise_name' => 'required|string|max:100',
            'sets' => 'required|integer',
            'reps' => 'required|integer',
            'weight_kg' => 'required|numeric',
            'rpe' => 'nullable|integer|between:1,10',
            'rir' => 'nullable|integer',
            'session_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Regla de Oro: Saneamiento de notas
        if (isset($validated['notes'])) {
            $validated['notes'] = TextCleaner::sanitize($validated['notes']);
        }

        // Use target user ID
        $validated['user_id'] = $this->getTargetUserId($request);

        $workoutLog = WorkoutLog::create($validated);

        return response()->json([
            'message' => 'Entrenamiento registrado con éxito',
            'data' => $workoutLog
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(WorkoutLog::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $workoutLog = WorkoutLog::findOrFail($id);
        
        $validated = $request->validate([
            'exercise_name' => 'string|max:100',
            'sets' => 'integer',
            'reps' => 'integer',
            'weight_kg' => 'numeric',
            'rpe' => 'nullable|integer|between:1,10',
            'rir' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['notes'])) {
            $validated['notes'] = TextCleaner::sanitize($validated['notes']);
        }

        $workoutLog->update($validated);

        return response()->json($workoutLog);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        WorkoutLog::destroy($id);
        return response()->json(null, 204);
    }
}
