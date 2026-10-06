<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\Exercise;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomExerciseAndWeightsTest extends TestCase
{
    use RefreshDatabase;

    private function coachWithMicrocycle(): array
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

        return [$coach, $microcycle];
    }

    public function test_coach_can_create_custom_exercise_visible_only_to_them(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherCoach = User::factory()->create(['role' => 'coach']);
        Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'Piernas']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/exercises', [
                'name' => 'Hip Thrust',
                'pattern' => 'bisagra_cadera',
                'primary_muscles' => ['glúteo'],
                'equipment' => 'barra',
                'level' => 'medio',
            ])
            ->assertCreated()
            ->assertJsonPath('coach_id', $coach->id);

        $this->actingAs($coach, 'sanctum')->getJson('/api/v1/exercises')->assertJsonCount(2);
        $this->actingAs($otherCoach, 'sanctum')->getJson('/api/v1/exercises')->assertJsonCount(1);
    }

    public function test_client_cannot_create_exercises(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/coach/exercises', ['name' => 'X', 'muscle_group' => 'Y'])
            ->assertForbidden();
    }

    public function test_coach_cannot_use_another_coachs_custom_exercise(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $otherCoach = User::factory()->create(['role' => 'coach']);
        $foreign = Exercise::create(['coach_id' => $otherCoach->id, 'name' => 'Ajeno', 'muscle_group' => 'Pecho']);

        $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Día 1',
                'exercises' => [['exercise_id' => $foreign->id]],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('exercises.0.exercise_id');
    }

    public function test_session_stores_up_to_three_weights_with_unit(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $exercise = Exercise::create(['name' => 'Press de Banca', 'muscle_group' => 'Pecho']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Empuje',
                'exercises' => [[
                    'exercise_id' => $exercise->id,
                    'target_sets' => 4,
                    'target_reps' => 12,
                    'target_weights' => [60, 65.5, null],
                    'weight_unit' => 'lb',
                    'target_rpe' => 8,
                ]],
            ]);

        $response->assertCreated()
            ->assertJsonPath('session_exercises.0.target_weights', [60, 65.5])
            ->assertJsonPath('session_exercises.0.weight_unit', 'lb');
    }

    public function test_rejects_more_than_three_weights_or_invalid_unit(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $exercise = Exercise::create(['name' => 'Press de Banca', 'muscle_group' => 'Pecho']);

        $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Empuje',
                'exercises' => [[
                    'exercise_id' => $exercise->id,
                    'target_weights' => [1, 2, 3, 4],
                    'weight_unit' => 'oz',
                ]],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['exercises.0.target_weights', 'exercises.0.weight_unit']);
    }

    public function test_session_stores_a_sanitized_note_per_exercise(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'Piernas']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Piernas',
                'exercises' => [[
                    'exercise_id' => $exercise->id,
                    'notes' => "  Bajar lento,   pausa de 1s abajo. <b>importante</b>  ",
                ]],
            ]);

        $response->assertCreated()->assertJsonPath(
            'session_exercises.0.notes',
            'Bajar lento, pausa de 1s abajo. importante',
        );
    }

    public function test_exercise_note_is_optional_and_defaults_to_null(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'Piernas']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Piernas',
                'exercises' => [['exercise_id' => $exercise->id]],
            ]);

        $response->assertCreated()->assertJsonPath('session_exercises.0.notes', null);
    }

    public function test_exercise_note_has_a_max_length(): void
    {
        [$coach, $microcycle] = $this->coachWithMicrocycle();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'Piernas']);

        $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle->id}/sessions", [
                'name' => 'Piernas',
                'exercises' => [[
                    'exercise_id' => $exercise->id,
                    'notes' => str_repeat('a', 1001),
                ]],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('exercises.0.notes');
    }
}
