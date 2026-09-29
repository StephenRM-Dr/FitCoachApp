<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExerciseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

use App\Models\Exercise;

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
     * @group Coach - Catálogo
     * Crea un ejercicio personalizado. Solo lo ve (y usa) el coach que lo crea.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'muscle_group' => 'required|string|max:50',
            'description' => 'nullable|string|max:1000',
        ]);

        $exercise = Exercise::create([...$validated, 'coach_id' => $request->user()->id]);

        return (new ExerciseResource($exercise))->response()->setStatusCode(201);
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
            'image' => 'required|file|mimes:jpeg,png,gif,webp|max:5120',
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
