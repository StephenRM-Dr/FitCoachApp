<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'microcycle_id' => $this->microcycle_id,
            'name' => $this->name,
            'day_of_week' => $this->day_of_week,
            'session_exercises' => SessionExerciseResource::collection($this->whenLoaded('sessionExercises')),
        ];
    }
}
