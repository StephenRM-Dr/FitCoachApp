<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NutritionLog extends Model
{
    protected $fillable = ['user_id', 'water_liters', 'sleep_hours', 'session_completed', 'calories_consumed', 'recorded_at'];
}
