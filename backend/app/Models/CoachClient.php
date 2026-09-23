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

    /**
     * ¿El cliente está asignado a este coach? Único punto de verdad para
     * los checks de ownership coach→cliente en los controladores.
     */
    public static function isAssigned(int $coachId, int $clientId): bool
    {
        return static::where('coach_id', $coachId)
            ->where('client_id', $clientId)
            ->exists();
    }
}
