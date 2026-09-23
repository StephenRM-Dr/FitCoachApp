<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutSession extends Model
{
    protected $fillable = [
        'microcycle_id',
        'name',
        'day_of_week',
    ];

    public function microcycle()
    {
        return $this->belongsTo(Microcycle::class);
    }

    public function sessionExercises()
    {
        return $this->hasMany(SessionExercise::class);
    }

    public function executions()
    {
        return $this->hasMany(WorkoutExecution::class);
    }
}
