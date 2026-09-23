<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NutritionSettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'nutrition_enabled' => $this->nutrition_enabled,
            'macro_protein_pct' => $this->macro_protein_pct,
            'macro_carbs_pct' => $this->macro_carbs_pct,
            'macro_fat_pct' => $this->macro_fat_pct,
        ];
    }
}
