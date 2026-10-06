<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['coach_id', 'client_id', 'sender_id', 'body'];

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
