<?php

namespace Tests\Feature\Client;

use App\Models\Exercise;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutExecutionTest extends TestCase
{
    use RefreshDatabase;

    private function buildSessionFor(User $client): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $program = Program::create([
            'coach_id' => $coach->id,
            'client_id' => $client->id,
            'name' => 'Programa activo',
            'status' => 'active',
        ]);
        $mesocycle = Mesocycle::create([
            'program_id' => $program->id,
            'name' => 'Meso 1',
            'start_week' => 1,
            'end_week' => 4,
        ]);
        $microcycle = Microcycle::create([
            'mesocycle_id' => $mesocycle->id,
            'week_number' => 1,
        ]);
        $session = WorkoutSession::create([
            'microcycle_id' => $microcycle->id,
            'name' => 'Día 1 - Piernas',
        ]);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);

        return [$program, $session, $exercise];
    }

    public function test_client_sees_only_their_own_active_program(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [$program] = $this->buildSessionFor($client);

        $otherClient = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client, 'sanctum')->getJson('/api/v1/client/programs/active');
        $response->assertOk();
        $this->assertSame($program->id, $response->json('id'));
        $this->assertEqualsCanonicalizing(
            ['id', 'coach_id', 'client_id', 'name', 'start_date', 'end_date', 'status', 'mesocycles'],
            array_keys($response->json())
        );

        $otherResponse = $this->actingAs($otherClient, 'sanctum')->getJson('/api/v1/client/programs/active');
        $otherResponse->assertOk();
        // Laravel's TestResponse::json() trata cualquier body decodificado a
        // null como "JSON inválido" (ver TestResponse::decodeResponseJson),
        // así que se compara el contenido crudo en vez de usar ->json().
        $this->assertSame('null', $otherResponse->getContent());
    }

    public function test_client_cannot_open_a_session_from_another_clients_program(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [, $session] = $this->buildSessionFor($client);

        $intruder = User::factory()->create(['role' => 'client']);

        $this->actingAs($intruder, 'sanctum')
            ->getJson("/api/v1/client/sessions/{$session->id}")
            ->assertStatus(404);

        $this->actingAs($client, 'sanctum')
            ->getJson("/api/v1/client/sessions/{$session->id}")
            ->assertOk();
    }

    public function test_client_can_store_execution_with_sets_and_only_sees_own_history(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [, $session, $exercise] = $this->buildSessionFor($client);

        $response = $this->actingAs($client, 'sanctum')->postJson('/api/v1/client/executions', [
            'workout_session_id' => $session->id,
            'session_rpe' => 8,
            'sets' => [
                ['exercise_id' => $exercise->id, 'set_number' => 1, 'weight_kg' => 80, 'reps_performed' => 8, 'rpe' => 8],
                ['exercise_id' => $exercise->id, 'set_number' => 2, 'weight_kg' => 80, 'reps_performed' => 7, 'rpe' => 9],
            ],
        ]);

        $response->assertCreated();
        // 'workout_session' se omite porque storeExecution solo eager-carga
        // executionSets.exercise (JsonResource::whenLoaded quita la clave).
        $this->assertEqualsCanonicalizing(
            ['id', 'workout_session_id', 'user_id', 'started_at', 'completed_at', 'session_rpe', 'notes', 'execution_sets'],
            array_keys($response->json())
        );
        $this->assertCount(2, $response->json('execution_sets'));
        $this->assertSame($client->id, $response->json('user_id'));

        $otherClient = User::factory()->create(['role' => 'client']);
        $historyResponse = $this->actingAs($otherClient, 'sanctum')->getJson('/api/v1/client/executions/history');
        $historyResponse->assertOk();
        $this->assertCount(0, $historyResponse->json('data'));

        $ownHistory = $this->actingAs($client, 'sanctum')->getJson('/api/v1/client/executions/history');
        $ownHistory->assertOk();
        $this->assertCount(1, $ownHistory->json('data'));
    }

    public function test_client_can_attach_a_comment_per_exercise_when_storing_execution(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [, $session, $exercise] = $this->buildSessionFor($client);

        $response = $this->actingAs($client, 'sanctum')->postJson('/api/v1/client/executions', [
            'workout_session_id' => $session->id,
            'sets' => [
                ['exercise_id' => $exercise->id, 'set_number' => 1, 'notes' => 'Me costó la última serie'],
                ['exercise_id' => $exercise->id, 'set_number' => 2, 'notes' => 'Me costó la última serie'],
            ],
        ]);

        $response->assertCreated();
        $sets = $response->json('execution_sets');
        $this->assertCount(2, $sets);
        foreach ($sets as $set) {
            $this->assertSame('Me costó la última serie', $set['notes']);
        }

        $history = $this->actingAs($client, 'sanctum')->getJson('/api/v1/client/executions/history');
        $history->assertOk();
        $this->assertSame(
            'Me costó la última serie',
            $history->json('data.0.execution_sets.0.notes')
        );
    }

    public function test_client_cannot_store_execution_for_a_session_not_theirs(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [, $session, $exercise] = $this->buildSessionFor($client);

        $intruder = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($intruder, 'sanctum')->postJson('/api/v1/client/executions', [
            'workout_session_id' => $session->id,
            'sets' => [
                ['exercise_id' => $exercise->id, 'set_number' => 1],
            ],
        ]);

        $response->assertStatus(404);
    }
}
