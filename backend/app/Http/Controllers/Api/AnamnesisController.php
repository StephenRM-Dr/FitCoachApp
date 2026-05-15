<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use App\Models\MedicalHistory;
use App\Services\TextCleaner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnamnesisController extends Controller
{
    /**
     * Guarda o actualiza el perfil y la historia médica del usuario.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Perfil
            'age' => 'nullable|integer',
            'occupation' => 'nullable|string|max:100',
            'activity_level' => 'nullable|in:sedentario,ligero,activo,muy_activo',
            'main_objective' => 'nullable|string|max:255',
            
            // Historia Médica
            'pathologies' => 'nullable|string',
            'injuries' => 'nullable|string',
            'surgeries' => 'nullable|string',
            'medications' => 'nullable|string',
            'is_smoker' => 'nullable|boolean',
            'family_history' => 'nullable|string',
        ]);

        // Saneamiento de textos según la "Regla de Oro"
        $textFields = ['pathologies', 'injuries', 'surgeries', 'medications', 'family_history', 'main_objective'];
        foreach ($textFields as $field) {
            if (isset($validated[$field])) {
                $validated[$field] = TextCleaner::sanitize($validated[$field]);
            }
        }

        // Use target user ID (handles both client and coach requests)
        $userId = $this->getTargetUserId($request);

        try {
            DB::beginTransaction();

            $profile = UserProfile::updateOrCreate(
                ['user_id' => $userId],
                [
                    'age' => $validated['age'] ?? null,
                    'occupation' => $validated['occupation'] ?? null,
                    'activity_level' => $validated['activity_level'] ?? null,
                    'main_objective' => $validated['main_objective'] ?? null,
                ]
            );

            $history = MedicalHistory::updateOrCreate(
                ['user_id' => $userId],
                [
                    'pathologies' => $validated['pathologies'] ?? null,
                    'injuries' => $validated['injuries'] ?? null,
                    'surgeries' => $validated['surgeries'] ?? null,
                    'medications' => $validated['medications'] ?? null,
                    'is_smoker' => $validated['is_smoker'] ?? false,
                    'family_history' => $validated['family_history'] ?? null,
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Anamnesis guardada con éxito',
                'data' => [
                    'profile' => $profile,
                    'history' => $history
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al guardar los datos'], 500);
        }
    }

    /**
     * Obtiene los datos de anamnesis del usuario.
     */
    public function index(Request $request)
    {
        $userId = $this->getTargetUserId($request);
        $profile = UserProfile::where('user_id', $userId)->first();
        $history = MedicalHistory::where('user_id', $userId)->first();

        return response()->json([
            'profile' => $profile,
            'history' => $history
        ]);
    }
}
