<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExerciseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Models\Exercise;

class ExerciseController extends Controller
{
    /**
     * @group Catálogo
     * @unauthenticated
     * Lista de ejercicios
     */
    public function index()
    {
        return ExerciseResource::collection(Exercise::all());
    }

    /**
     * @group Coach - Catálogo
     * Sube (o reemplaza) la imagen/GIF de un ejercicio del catálogo. Es un
     * recurso compartido: se sube una vez por ejercicio y lo ven todos los
     * coaches, no una subida por sesión.
     */
    public function uploadMedia(Request $request, Exercise $exercise)
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        // Se guarda solo la ruta relativa al disco 'public', no la URL
        // absoluta: la URL final se arma en ExerciseResource a partir del
        // host de cada request, para que funcione igual detrás de un túnel
        // (ngrok/IP LAN) cuyo host no coincide con el APP_URL del backend.
        $exercise->image_url = Storage::disk('public')->putFile('exercises', $request->file('image'));
        $exercise->save();

        return new ExerciseResource($exercise);
    }
}
