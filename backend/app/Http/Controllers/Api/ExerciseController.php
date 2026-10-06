<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExerciseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

use App\Models\Exercise;
use App\Support\ExerciseTaxonomy;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ExerciseController extends Controller
{
    /**
     * @group Catálogo
     * Lista de ejercicios
     */
    public function index(Request $request)
    {
        return ExerciseResource::collection(
            Exercise::visibleTo($request->user()->id)->orderBy('name')->get()
        );
    }

    /**
     * @group Catálogo
     * Listas cerradas para crear y filtrar ejercicios: grupos, músculos,
     * patrones, equipamiento y niveles.
     */
    public function taxonomy()
    {
        return response()->json(ExerciseTaxonomy::toArray());
    }

    /**
     * @group Coach - Catálogo
     * Crea un ejercicio personalizado con el formato del catálogo. Solo lo ve
     * (y usa) el coach que lo crea. El grupo muscular se calcula a partir de
     * los músculos primarios, no se elige a mano.
     */
    public function store(Request $request)
    {
        $muscles = array_keys(ExerciseTaxonomy::MUSCLES);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'pattern' => ['required', Rule::in(array_keys(ExerciseTaxonomy::PATTERNS))],
            'primary_muscles' => 'required|array|min:1|max:4',
            'primary_muscles.*' => ['distinct', Rule::in($muscles)],
            'secondary_muscles' => 'nullable|array|max:6',
            'secondary_muscles.*' => ['distinct', Rule::in($muscles)],
            'equipment' => ['required', Rule::in(array_keys(ExerciseTaxonomy::EQUIPMENT))],
            'level' => ['required', Rule::in(array_keys(ExerciseTaxonomy::LEVELS))],
            'contraindications' => 'nullable|array|max:10',
            'contraindications.*' => 'string|max:150',
            'technical_cues' => 'nullable|array|max:10',
            'technical_cues.*' => 'string|max:200',
            'notes' => 'nullable|string|max:1000',
        ]);

        $coachId = $request->user()->id;

        $exercise = Exercise::create([
            ...$validated,
            'coach_id' => $coachId,
            'slug' => $this->uniqueSlug($validated['name'], $coachId),
            'muscle_group' => ExerciseTaxonomy::groupFor($validated['pattern'], $validated['primary_muscles']),
            'secondary_muscles' => $validated['secondary_muscles'] ?? [],
            'contraindications' => $validated['contraindications'] ?? [],
            'technical_cues' => $validated['technical_cues'] ?? [],
        ]);

        return (new ExerciseResource($exercise))->response()->setStatusCode(201);
    }

    /**
     * Slug único: los personalizados llevan el id del coach para no chocar
     * con el catálogo global ni con los de otros coaches.
     */
    private function uniqueSlug(string $name, int $coachId): string
    {
        $base = Str::slug($name).'-c'.$coachId;
        $slug = $base;
        $n = 2;

        while (Exercise::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }

    /**
     * @group Coach - Catálogo
     * Sube (o reemplaza) la imagen/GIF de un ejercicio del catálogo. Es un
     * recurso compartido: se sube una vez por ejercicio y lo ven todos los
     * coaches, no una subida por sesión.
     */
    public function uploadMedia(Request $request, Exercise $exercise)
    {
        // Un ejercicio personalizado solo lo puede modificar su creador.
        if ($exercise->coach_id !== null && $exercise->coach_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes acceso a este ejercicio.'], 403);
        }

        $request->validate([
            // "GIF" aquí incluye .mp4: muchas referencias de ejercicio son en
            // realidad videos en loop (mismo efecto visual, mucho más
            // livianos que un GIF real). 20 MB cubre un clip corto sin
            // comprimir demasiado.
            'image' => 'required|file|mimes:jpeg,png,gif,webp,mp4|max:20480',
        ]);

        // Se guarda solo la ruta relativa al disco 'public', no la URL
        // absoluta: la URL final se arma en ExerciseResource a partir del
        // host de cada request, para que funcione igual detrás de un túnel
        // (ngrok/IP LAN) cuyo host no coincide con el APP_URL del backend.
        $path = Storage::disk(config('fitcoach.media_disk'))->putFile('exercises', $request->file('image'));

        // Los discos remotos (R2/S3) usan throw=false: ante un fallo (SSL,
        // credenciales, bucket) putFile devuelve false en vez de lanzar. Sin
        // esta comprobación se guardaba image_url=false y la API respondía
        // 200 con la imagen vacía, ocultando el error.
        if ($path === false) {
            Log::error('No se pudo guardar la imagen del ejercicio', [
                'exercise_id' => $exercise->id,
                'disk' => config('fitcoach.media_disk'),
            ]);

            return response()->json(['message' => 'No se pudo guardar la imagen. Intenta de nuevo.'], 500);
        }

        $exercise->image_url = $path;
        $exercise->save();

        return new ExerciseResource($exercise);
    }
}
