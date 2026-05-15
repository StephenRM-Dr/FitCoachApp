<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Microcycle;
use App\Models\Mesocycle;

class MicrocycleController extends Controller
{
    /**
     * @group Coach - Planificación
     * Añadir una semana (microciclo)
     * @urlParam mesocycleId integer required The ID of the mesocycle.
     */
    public function store(Request $request, $mesocycleId)
    {
        $request->validate([
            'week_number' => 'required|integer',
            'focus' => 'nullable|string|max:100',
        ]);
        
        $mesocycle = Mesocycle::with('program')->findOrFail($mesocycleId);
        if ($mesocycle->program->coach_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $microcycle = Microcycle::create([
            'mesocycle_id' => $mesocycle->id,
            'week_number' => $request->week_number,
            'focus' => $request->focus,
        ]);
        
        return response()->json($microcycle, 201);
    }
}
