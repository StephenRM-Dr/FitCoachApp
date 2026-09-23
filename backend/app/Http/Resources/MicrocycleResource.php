<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MicrocycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mesocycle_id' => $this->mesocycle_id,
            'week_number' => $this->week_number,
            'focus' => $this->focus,
            'workout_sessions' => WorkoutSessionResource::collection($this->whenLoaded('workoutSessions')),
        ];
    }
}
