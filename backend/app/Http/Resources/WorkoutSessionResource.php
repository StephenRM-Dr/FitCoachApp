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
            'session_exercises_count' => $this->whenCounted('sessionExercises'),
            // Cada sesión pertenece a un microciclo (semana) concreto y no se
            // reutiliza entre semanas, así que "¿ya se hizo?" es solo "¿tiene
            // alguna ejecución?" — no hace falta acotar por rango de fechas.
            // Solo se calcula cuando el controlador cargó 'executions'
            // (hoy, el programa activo del cliente); en los endpoints del
            // coach, que no la cargan, estas claves no aparecen.
            'is_completed' => $this->when(
                $this->relationLoaded('executions'),
                fn () => $this->executions->isNotEmpty(),
            ),
            'last_execution_at' => $this->when(
                $this->relationLoaded('executions'),
                fn () => $this->executions->max('completed_at'),
            ),
        ];
    }
}
