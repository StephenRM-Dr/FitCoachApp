<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Microcycle extends Model
{
    protected $fillable = [
        'mesocycle_id',
        'week_number',
        'focus',
    ];

    public function mesocycle()
    {
        return $this->belongsTo(Mesocycle::class);
    }

    public function workoutSessions()
    {
        return $this->hasMany(WorkoutSession::class);
    }
}
