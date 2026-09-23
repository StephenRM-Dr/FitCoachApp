<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExecutionSetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workout_execution_id' => $this->workout_execution_id,
            'exercise_id' => $this->exercise_id,
            'set_number' => $this->set_number,
            'weight_kg' => $this->weight_kg,
            'reps_performed' => $this->reps_performed,
            'rpe' => $this->rpe,
            'rir' => $this->rir,
            'notes' => $this->notes,
            'exercise' => new ExerciseResource($this->whenLoaded('exercise')),
        ];
    }
}
