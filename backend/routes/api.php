<?php
use App\Http\Controllers\Api\AnamnesisController;
use App\Http\Controllers\Api\AnthropometricController;
use App\Http\Controllers\Api\NutritionLogController;
use App\Http\Controllers\Api\NutritionSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CoachController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\Coach\ProgramController;
use App\Http\Controllers\Api\Coach\MesocycleController;
use App\Http\Controllers\Api\Coach\MicrocycleController;
use App\Http\Controllers\Api\Coach\WorkoutSessionController;
use App\Http\Controllers\Api\Coach\WeeklyPlanController;
use App\Http\Controllers\Api\Client\WorkoutController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return new UserResource($request->user());
})->middleware('auth:sanctum');

// Rutas públicas de autenticación, con rate limiting contra fuerza bruta.
Route::prefix('v1')->middleware('throttle:10,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/reset', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:3,1');
    Route::post('password/reset/confirm', [AuthController::class, 'confirmResetCode'])
        ->middleware('throttle:5,1');
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('password/update', [AuthController::class, 'updatePassword']);

    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    // Diagnóstico y seguimiento (dueño de los datos: el usuario autenticado)
    Route::post('anamnesis', [AnamnesisController::class, 'store']);
    Route::get('anamnesis', [AnamnesisController::class, 'index']);

    Route::get('anthropometrics', [AnthropometricController::class, 'index']);
    Route::post('anthropometrics', [AnthropometricController::class, 'store']);
    Route::get('anthropometrics/latest', [AnthropometricController::class, 'latest']);

    Route::get('nutrition-logs', [NutritionLogController::class, 'index']);
    Route::post('nutrition-logs', [NutritionLogController::class, 'store']);
    Route::get('nutrition-logs/today', [NutritionLogController::class, 'today']);
    Route::get('nutrition-settings', [NutritionSettingsController::class, 'show']);

    // Catálogo (ambos roles)
    Route::get('exercises', [ExerciseController::class, 'index']);

    // Coach: gestión de clientes y planificación (periodización)
    Route::prefix('coach')->middleware('role:coach')->group(function () {
        Route::get('available-clients', [CoachController::class, 'getAvailableClients']);
        Route::post('assign-client', [CoachController::class, 'assignClient']);
        Route::get('my-clients', [CoachController::class, 'getMyClients']);

        Route::post('clients/{clientId}/weekly-plan', [WeeklyPlanController::class, 'ensureCurrent']);
        Route::post('exercises/{exercise}/media', [ExerciseController::class, 'uploadMedia']);
        Route::put('clients/{clientId}/nutrition-settings', [NutritionSettingsController::class, 'update']);

        Route::post('programs', [ProgramController::class, 'store']);
        Route::get('clients/{clientId}/programs', [ProgramController::class, 'indexByClient']);
        Route::post('programs/{programId}/mesocycles', [MesocycleController::class, 'store']);
        Route::post('mesocycles/{mesocycleId}/microcycles', [MicrocycleController::class, 'store']);
        Route::get('mesocycles/{mesocycleId}/microcycles', [MicrocycleController::class, 'index']);
        Route::get('mesocycles/{mesocycleId}/microcycles/week/{weekNumber}', [MicrocycleController::class, 'showByWeek']);
        Route::get('microcycles/{microcycleId}', [MicrocycleController::class, 'show']);
        Route::post('microcycles/{microcycleId}/sessions', [WorkoutSessionController::class, 'store']);
        Route::get('sessions/{sessionId}', [WorkoutSessionController::class, 'show']);
        Route::put('sessions/{sessionId}', [WorkoutSessionController::class, 'update']);
    });

    // Cliente: su coach y ejecución de entrenamientos
    Route::prefix('client')->middleware('role:client')->group(function () {
        Route::get('my-coach', [CoachController::class, 'getMyCoach']);

        Route::get('programs/active', [WorkoutController::class, 'activeProgram']);
        Route::get('sessions/{sessionId}', [WorkoutController::class, 'getSession']);
        Route::post('executions', [WorkoutController::class, 'storeExecution']);
        Route::get('executions/history', [WorkoutController::class, 'history']);
    });
});
