<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NutritionSettings extends Model
{
    protected $fillable = [
        'user_id',
        'nutrition_enabled',
        'macro_protein_pct',
        'macro_carbs_pct',
        'macro_fat_pct',
    ];

    protected function casts(): array
    {
        return [
            'nutrition_enabled' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
