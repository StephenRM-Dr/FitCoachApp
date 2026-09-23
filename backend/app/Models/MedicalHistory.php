<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalHistory extends Model
{
    protected $fillable = ['user_id', 'pathologies', 'injuries', 'surgeries', 'medications', 'is_smoker', 'family_history'];
}
