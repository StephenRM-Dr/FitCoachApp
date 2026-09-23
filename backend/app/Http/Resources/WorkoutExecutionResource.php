<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutExecutionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workout_session_id' => $this->workout_session_id,
            'user_id' => $this->user_id,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'session_rpe' => $this->session_rpe,
            'notes' => $this->notes,
            'workout_session' => new WorkoutSessionResource($this->whenLoaded('workoutSession')),
            'execution_sets' => ExecutionSetResource::collection($this->whenLoaded('executionSets')),
        ];
    }
}
