<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
        return response()->json(Exercise::all());
    }
}
