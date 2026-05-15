<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutLog extends Model
{
    protected $fillable = [
        'user_id',
        'exercise_name',
        'sets',
        'reps',
        'weight_kg',
        'rpe',
        'rir',
        'stress_index',
        'session_date',
        'notes',
    ];
}
