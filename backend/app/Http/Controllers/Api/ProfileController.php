<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Obtiene la información personal del usuario autenticado.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = UserProfile::where('user_id', $user->id)->first();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'age' => $profile->age ?? null,
            'occupation' => $profile->occupation ?? null,
            'activity_level' => $profile->activity_level ?? null,
            'main_objective' => $profile->main_objective ?? null,
        ]);
    }

    /**
     * Actualiza la información personal del usuario autenticado.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'age' => 'nullable|integer',
            'occupation' => 'nullable|string|max:100',
            'activity_level' => 'nullable|in:sedentario,ligero,activo,muy_activo',
            'main_objective' => 'nullable|string|max:255',
        ]);

        $user->fill([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
        ]);
        $user->save();

        // Los campos omitidos conservan su valor actual en vez de borrarse,
        // para permitir actualizaciones parciales del formulario.
        $existing = UserProfile::where('user_id', $user->id)->first();
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'age' => $request->has('age') ? $validated['age'] : $existing?->age,
                'occupation' => $request->has('occupation') ? $validated['occupation'] : $existing?->occupation,
                'activity_level' => $request->has('activity_level') ? $validated['activity_level'] : $existing?->activity_level,
                'main_objective' => $request->has('main_objective') ? $validated['main_objective'] : $existing?->main_objective,
            ],
        );

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'age' => $profile->age,
            'occupation' => $profile->occupation,
            'activity_level' => $profile->activity_level,
            'main_objective' => $profile->main_objective,
        ]);
    }
}
