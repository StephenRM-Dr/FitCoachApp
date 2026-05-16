<?php
use App\Http\Controllers\Api\WorkoutLogController;
use App\Http\Controllers\Api\AnamnesisController;
use App\Http\Controllers\Api\AnthropometricController;
use App\Http\Controllers\Api\NutritionLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CoachController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\Coach\ProgramController;
use App\Http\Controllers\Api\Coach\MesocycleController;
use App\Http\Controllers\Api\Coach\MicrocycleController;
use App\Http\Controllers\Api\Coach\WorkoutSessionController;
use App\Http\Controllers\Api\Client\WorkoutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('v1/register', [AuthController::class, 'register']);
Route::post('v1/login', [AuthController::class, 'login']);
Route::post('v1/password/reset', [AuthController::class, 'resetPassword']);

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('password/update', [AuthController::class, 'updatePassword']);
    Route::apiResource('workout-logs', WorkoutLogController::class);
    Route::post('anamnesis', [AnamnesisController::class, 'store']);
    Route::get('anamnesis', [AnamnesisController::class, 'index']);

    // Antropometría
    Route::get('anthropometrics', [AnthropometricController::class, 'index']);
    Route::post('anthropometrics', [AnthropometricController::class, 'store']);
    Route::get('anthropometrics/latest', [AnthropometricController::class, 'latest']);

    // Nutrición y Biofeedback
    Route::get('nutrition-logs', [NutritionLogController::class, 'index']);
    Route::post('nutrition-logs', [NutritionLogController::class, 'store']);
    Route::get('nutrition-logs/today', [NutritionLogController::class, 'today']);

    // Coach - Client Relationship
    Route::get('coach/available-clients', [CoachController::class, 'getAvailableClients']);
    Route::post('coach/assign-client', [CoachController::class, 'assignClient']);
    Route::get('coach/my-clients', [CoachController::class, 'getMyClients']);
    Route::get('client/my-coach', [CoachController::class, 'getMyCoach']);

    // --- NUEVA ARQUITECTURA DE PERIODIZACIÓN ---

    // Catálogo
    Route::get('exercises', [ExerciseController::class, 'index']);

    // Planificación (Coach)
    Route::post('coach/programs', [ProgramController::class, 'store']);
    Route::get('coach/clients/{clientId}/programs', [ProgramController::class, 'indexByClient']);
    Route::post('coach/programs/{programId}/mesocycles', [MesocycleController::class, 'store']);
    Route::post('coach/mesocycles/{mesocycleId}/microcycles', [MicrocycleController::class, 'store']);
    Route::post('coach/microcycles/{microcycleId}/sessions', [WorkoutSessionController::class, 'store']);

    // Ejecución (Alumno)
    Route::get('client/programs/active', [WorkoutController::class, 'activeProgram']);
    Route::get('client/sessions/{sessionId}', [WorkoutController::class, 'getSession']);
    Route::post('client/executions', [WorkoutController::class, 'storeExecution']);
    Route::get('client/executions/history', [WorkoutController::class, 'history']);
});
