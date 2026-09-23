<?php

namespace App\Http\Requests\Api\Coach;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkoutSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'day_of_week' => 'nullable|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'exercises' => 'required|array',
            'exercises.*.exercise_id' => 'required|exists:exercises,id',
            'exercises.*.target_sets' => 'nullable|integer',
            'exercises.*.target_reps' => 'nullable|integer',
            'exercises.*.target_rpe' => 'nullable|integer',
            'exercises.*.rest_time_seconds' => 'nullable|integer',
        ];
    }
}
