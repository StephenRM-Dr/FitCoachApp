<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = ['user_id', 'age', 'occupation', 'activity_level', 'main_objective'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
