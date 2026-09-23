<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NutritionLog;
use Illuminate\Http\Request;

class NutritionLogController extends Controller
{
    /**
     * Obtiene los registros de nutrición/biofeedback del usuario.
     */
    public function index(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        return response()->json(NutritionLog::where('user_id', $userId)->orderBy('recorded_at', 'desc')->get());
    }

    /**
     * Guarda un nuevo registro diario de nutrición y biofeedback.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'water_liters' => 'nullable|numeric',
            'sleep_hours' => 'nullable|numeric',
            'session_completed' => 'nullable|boolean',
            'calories_consumed' => 'nullable|integer',
            'recorded_at' => 'required|date',
        ]);

        $userId = $this->getTargetUserId($request);

        $log = NutritionLog::updateOrCreate(
            ['user_id' => $userId, 'recorded_at' => $validated['recorded_at']],
            $validated
        );

        return response()->json([
            'message' => 'Registro de nutrición/biofeedback guardado con éxito',
            'data' => $log
        ], 200);
    }

    /**
     * Obtiene el registro del día actual.
     */
    public function today(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        $today = date('Y-m-d');
        $log = NutritionLog::where('user_id', $userId)->where('recorded_at', $today)->first();
        return response()->json($log);
    }
}
