<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workout_session_id' => $this->workout_session_id,
            'exercise_id' => $this->exercise_id,
            'order' => $this->order,
            'target_sets' => $this->target_sets,
            'target_reps' => $this->target_reps,
            'target_rpe' => $this->target_rpe,
            'rest_time_seconds' => $this->rest_time_seconds,
            'exercise' => new ExerciseResource($this->whenLoaded('exercise')),
        ];
    }
}
