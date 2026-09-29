<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionExercise extends Model
{
    protected $fillable = [
        'workout_session_id',
        'exercise_id',
        'order',
        'target_sets',
        'target_reps',
        'target_weights',
        'weight_unit',
        'target_rpe',
        'rest_time_seconds',
    ];

    protected $casts = [
        'target_weights' => 'array',
    ];

    public function workoutSession()
    {
        return $this->belongsTo(WorkoutSession::class);
    }

    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }
}
