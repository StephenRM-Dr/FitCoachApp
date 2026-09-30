<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    protected $fillable = [
        'coach_id',
        'slug',
        'name',
        'muscle_group',
        'pattern',
        'primary_muscles',
        'secondary_muscles',
        'equipment',
        'level',
        'contraindications',
        'technical_cues',
        'notes',
        'description',
        'video_url',
    ];

    protected $casts = [
        'primary_muscles' => 'array',
        'secondary_muscles' => 'array',
        'contraindications' => 'array',
        'technical_cues' => 'array',
    ];

    /**
     * Catálogo global (coach_id null) más los ejercicios propios del usuario.
     */
    public function scopeVisibleTo($query, int $userId)
    {
        return $query->where(fn ($q) => $q->whereNull('coach_id')->orWhere('coach_id', $userId));
    }
}
