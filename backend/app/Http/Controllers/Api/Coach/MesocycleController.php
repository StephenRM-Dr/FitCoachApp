<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Mesocycle;
use App\Models\Program;

class MesocycleController extends Controller
{
    /**
     * @group Coach - Planificación
     * Crear un nuevo mesociclo
     * @urlParam programId integer required The ID of the program.
     */
    public function store(Request $request, $programId)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'start_week' => 'required|integer',
            'end_week' => 'required|integer|gte:start_week',
        ]);
        
        $program = Program::findOrFail($programId);
        if ($program->coach_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $mesocycle = Mesocycle::create([
            'program_id' => $program->id,
            'name' => $request->name,
            'start_week' => $request->start_week,
            'end_week' => $request->end_week,
        ]);
        
        return response()->json($mesocycle, 201);
    }
}
