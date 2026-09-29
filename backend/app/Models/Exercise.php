<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    protected $fillable = [
        'coach_id',
        'name',
        'muscle_group',
        'description',
        'video_url',
    ];

    /**
     * Catálogo global (coach_id null) más los ejercicios propios del usuario.
     */
    public function scopeVisibleTo($query, int $userId)
    {
        return $query->where(fn ($q) => $q->whereNull('coach_id')->orWhere('coach_id', $userId));
    }
}
