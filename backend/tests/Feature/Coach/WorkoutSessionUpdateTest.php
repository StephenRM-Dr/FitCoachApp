<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\Exercise;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutSessionUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function sessionWithOneExercise(): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);
        $program = Program::create([
            'coach_id' => $coach->id,
            'client_id' => $client->id,
            'name' => 'Plan',
            'status' => 'active',
        ]);
        $mesocycle = Mesocycle::create([
            'program_id' => $program->id,
            'name' => 'Meso 1',
            'start_week' => 1,
            'end_week' => 8,
        ]);
        $microcycle = Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        $session = WorkoutSession::create([
            'microcycle_id' => $microcycle->id,
            'name' => 'Día 1',
            'day_of_week' => 'lunes',
        ]);
        $exerciseA = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);
        $session->sessionExercises()->create([
            'exercise_id' => $exerciseA->id,
            'order' => 1,
            'target_sets' => 3,
            'target_reps' => 10,
        ]);

        return [$coach, $session, $exerciseA];
    }

    public function test_coach_can_rename_session_and_replace_its_exercises(): void
    {
        [$coach, $session] = $this->sessionWithOneExercise();
        $exerciseB = Exercise::create(['name' => 'Peso muerto', 'muscle_group' => 'espalda']);

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/sessions/{$session->id}", [
                'name' => 'Día 1 - Actualizado',
                'day_of_week' => 'martes',
                'exercises' => [
                    ['exercise_id' => $exerciseB->id, 'target_sets' => 4, 'target_reps' => 6],
                ],
            ]);

        $response->assertOk();
        $this->assertSame('Día 1 - Actualizado', $response->json('name'));
        $this->assertSame('martes', $response->json('day_of_week'));
        $this->assertCount(1, $response->json('session_exercises'));
        $this->assertSame($exerciseB->id, $response->json('session_exercises.0.exercise.id'));

        // La sesión reemplazada ya no tiene el ejercicio original en la base de datos.
        $this->assertDatabaseCount('session_exercises', 1);
    }

    public function test_coach_can_add_and_remove_exercises_from_saved_session(): void
    {
        [$coach, $session, $exerciseA] = $this->sessionWithOneExercise();
        $exerciseB = Exercise::create(['name' => 'Press banca', 'muscle_group' => 'pecho']);

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/sessions/{$session->id}", [
                'name' => $session->name,
                'day_of_week' => $session->day_of_week,
                'exercises' => [
                    ['exercise_id' => $exerciseA->id, 'target_sets' => 3, 'target_reps' => 10],
                    ['exercise_id' => $exerciseB->id, 'target_sets' => 3, 'target_reps' => 12],
                ],
            ]);

        $response->assertOk();
        $this->assertCount(2, $response->json('session_exercises'));
    }

    public function test_coach_cannot_update_another_coachs_session(): void
    {
        [, $session, $exerciseA] = $this->sessionWithOneExercise();
        $otherCoach = User::factory()->create(['role' => 'coach']);

        $response = $this->actingAs($otherCoach, 'sanctum')
            ->putJson("/api/v1/coach/sessions/{$session->id}", [
                'name' => 'Intento no autorizado',
                'exercises' => [
                    ['exercise_id' => $exerciseA->id, 'target_sets' => 3, 'target_reps' => 10],
                ],
            ]);

        $response->assertStatus(403);
    }

    public function test_update_requires_at_least_the_exercises_array(): void
    {
        [$coach, $session] = $this->sessionWithOneExercise();

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/sessions/{$session->id}", [
                'name' => 'Sin ejercicios',
            ]);

        $response->assertStatus(422);
    }
}
