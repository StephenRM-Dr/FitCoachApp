<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anthropometric;
use Illuminate\Http\Request;

class AnthropometricController extends Controller
{
    /**
     * Obtiene los registros antropométricos del usuario.
     */
    public function index(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        return response()->json(Anthropometric::where('user_id', $userId)->orderBy('recorded_at', 'desc')->get());
    }

    /**
     * Guarda un nuevo registro antropométrico.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'waist_cm' => 'nullable|numeric',
            'hip_cm' => 'nullable|numeric',
            'fcr_lpm' => 'nullable|integer',
            'recorded_at' => 'required|date',
        ]);

        $validated['user_id'] = $this->getTargetUserId($request);

        $anthropometric = Anthropometric::create($validated);

        return response()->json([
            'message' => 'Registro antropométrico guardado con éxito',
            'data' => $anthropometric
        ], 201);
    }

    /**
     * Obtiene el último registro antropométrico para el perfil.
     */
    public function latest(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        $latest = Anthropometric::where('user_id', $userId)->orderBy('recorded_at', 'desc')->first();
        return response()->json($latest);
    }
}
