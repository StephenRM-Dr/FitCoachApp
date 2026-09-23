<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'muscle_group' => $this->muscle_group,
            'description' => $this->description,
            'video_url' => $this->video_url,
            // image_url se guarda como ruta relativa (ver ExerciseController)
            // y se resuelve a absoluta con el host de esta request, no con
            // APP_URL — así el link sirve tanto en localhost como detrás de
            // un túnel ngrok o una IP de LAN.
            'image_url' => $this->image_url
                ? $request->getSchemeAndHttpHost().'/storage/'.$this->image_url
                : null,
        ];
    }
}
