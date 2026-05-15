<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anthropometric extends Model
{
    protected $fillable = ['user_id', 'weight', 'height', 'waist_cm', 'hip_cm', 'fcr_lpm', 'recorded_at'];
}
