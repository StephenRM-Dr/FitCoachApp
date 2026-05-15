<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoachClient extends Model
{
    protected $fillable = ['coach_id', 'client_id'];

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
