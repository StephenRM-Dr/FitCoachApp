<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesocycle extends Model
{
    protected $fillable = [
        'program_id',
        'name',
        'start_week',
        'end_week',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function microcycles()
    {
        return $this->hasMany(Microcycle::class);
    }
}
