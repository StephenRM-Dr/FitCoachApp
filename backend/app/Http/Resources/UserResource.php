<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Forma pública del usuario. Cualquier campo nuevo del modelo queda
     * fuera de las respuestas de la API hasta añadirse aquí explícitamente
     * (minimización de datos).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'gender' => $this->gender,
            'force_password_change' => (bool) $this->force_password_change,
        ];
    }
}
