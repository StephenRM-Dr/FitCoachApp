<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MesocycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'name' => $this->name,
            'start_week' => $this->start_week,
            'end_week' => $this->end_week,
            'microcycles' => MicrocycleResource::collection($this->whenLoaded('microcycles')),
        ];
    }
}
