<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'coach_id' => $this->coach_id,
            'client_id' => $this->client_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'created_at' => $this->created_at,
        ];
    }
}
