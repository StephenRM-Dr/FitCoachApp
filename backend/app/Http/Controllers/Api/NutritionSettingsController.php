<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NutritionSettingsResource;
use App\Models\NutritionSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NutritionSettingsController extends Controller
{
    /**
     * @group Nutrición
     * Estado de habilitación de la sección de Nutrición y los porcentajes
     * de macronutrientes configurados por el coach. El cliente ve los
     * suyos; el coach puede ver los de un alumno pasando `client_id`.
     */
    public function show(Request $request)
    {
        $userId = (int) $this->getTargetUserId($request);

        $settings = NutritionSettings::firstOrCreate(
            ['user_id' => $userId],
            [
                'nutrition_enabled' => false,
                'macro_protein_pct' => 30,
                'macro_carbs_pct' => 45,
                'macro_fat_pct' => 25,
            ]
        );

        // Laravel pone 201 automáticamente si el modelo del Resource fue
        // creado recién (wasRecentlyCreated) — pero esto es un GET que solo
        // auto-provisiona un default como detalle interno, no una creación
        // visible para el cliente. Se fuerza 200 explícitamente.
        return (new NutritionSettingsResource($settings))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * @group Coach - Nutrición
     * Habilita/deshabilita la sección de Nutrición de un alumno y define
     * sus porcentajes de macronutrientes. Exclusivo del coach asignado —
     * no existe ningún endpoint por el cual el cliente pueda auto-habilitarla.
     */
    public function update(Request $request, $clientId)
    {
        $this->authorizeCoachOwnsClient($request, (int) $clientId);

        $validated = $request->validate([
            'nutrition_enabled' => 'required|boolean',
            'macro_protein_pct' => 'required|integer|min:0|max:100',
            'macro_carbs_pct' => 'required|integer|min:0|max:100',
            'macro_fat_pct' => 'required|integer|min:0|max:100',
        ]);

        $sum = $validated['macro_protein_pct'] + $validated['macro_carbs_pct'] + $validated['macro_fat_pct'];
        if ($sum !== 100) {
            throw ValidationException::withMessages([
                'macro_protein_pct' => ["Los porcentajes de macronutrientes deben sumar 100% (actual: {$sum}%)."],
            ]);
        }

        $settings = NutritionSettings::updateOrCreate(
            ['user_id' => (int) $clientId],
            $validated
        );

        // Mismo motivo que en show(): un PUT idempotente no debe devolver
        // 201 solo porque la primera vez creó la fila internamente.
        return (new NutritionSettingsResource($settings))
            ->response()
            ->setStatusCode(200);
    }
}
