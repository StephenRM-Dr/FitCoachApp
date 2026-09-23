<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutExecution extends Model
{
    protected $fillable = [
        'workout_session_id',
        'user_id',
        'started_at',
        'completed_at',
        'session_rpe',
        'notes',
    ];

    public function workoutSession()
    {
        return $this->belongsTo(WorkoutSession::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function executionSets()
    {
        return $this->hasMany(ExecutionSet::class);
    }
}
