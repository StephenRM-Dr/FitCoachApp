<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExecutionSet extends Model
{
    protected $fillable = [
        'workout_execution_id',
        'exercise_id',
        'set_number',
        'weight_kg',
        'reps_performed',
        'rpe',
        'rir',
        'notes',
    ];

    public function workoutExecution()
    {
        return $this->belongsTo(WorkoutExecution::class);
    }

    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }
}
