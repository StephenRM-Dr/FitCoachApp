<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'coach_id' => $this->coach_id,
            'slug' => $this->slug,
            'name' => $this->name,
            'muscle_group' => $this->muscle_group,
            'pattern' => $this->pattern,
            'primary_muscles' => $this->primary_muscles ?? [],
            'secondary_muscles' => $this->secondary_muscles ?? [],
            'equipment' => $this->equipment,
            'level' => $this->level,
            'contraindications' => $this->contraindications ?? [],
            'technical_cues' => $this->technical_cues ?? [],
            'notes' => $this->notes,
            'description' => $this->description,
            'video_url' => $this->video_url,
            'image_url' => $this->imageUrl($request),
        ];
    }

    /**
     * image_url se guarda como ruta relativa (ver ExerciseController).
     *
     * Con el disco local "public" se resuelve a absoluta con el host de esta
     * request, no con APP_URL — así el link sirve en localhost, detrás de un
     * túnel ngrok o de una IP de LAN. Con un disco remoto (R2/S3) la URL la
     * da el propio disco.
     */
    private function imageUrl(Request $request): ?string
    {
        if (! $this->image_url) {
            return null;
        }

        $disk = config('fitcoach.media_disk');

        return $disk === 'public'
            ? $request->getSchemeAndHttpHost().'/storage/'.$this->image_url
            : Storage::disk($disk)->url($this->image_url);
    }
}
