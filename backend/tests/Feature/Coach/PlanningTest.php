<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\Exercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanningTest extends TestCase
{
    use RefreshDatabase;

    private function coachWithAssignedClient(): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);

        return [$coach, $client];
    }

    public function test_coach_can_create_program_for_assigned_client(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($coach, 'sanctum')->postJson('/api/v1/coach/programs', [
            'client_id' => $client->id,
            'name' => 'Fuerza 12 semanas',
        ]);

        $response->assertCreated();
        // 'mesocycles' se omite porque el programa recién creado no eager-carga
        // la relación (JsonResource::whenLoaded quita la clave, no la deja en []).
        $this->assertEqualsCanonicalizing(
            ['id', 'coach_id', 'client_id', 'name', 'start_date', 'end_date', 'status'],
            array_keys($response->json())
        );
        $this->assertSame($coach->id, $response->json('coach_id'));
        $this->assertSame($client->id, $response->json('client_id'));
    }

    public function test_coach_cannot_create_program_for_unassigned_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherClient = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($coach, 'sanctum')->postJson('/api/v1/coach/programs', [
            'client_id' => $otherClient->id,
            'name' => 'No autorizado',
        ]);

        $response->assertStatus(403);
    }

    public function test_client_cannot_access_coach_planning_routes(): void
    {
        [, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($client, 'sanctum')->postJson('/api/v1/coach/programs', [
            'client_id' => $client->id,
            'name' => 'Intento no autorizado',
        ]);

        $response->assertStatus(403);
    }

    public function test_coach_can_build_full_planning_hierarchy_and_read_it_back(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);

        $program = $this->actingAs($coach, 'sanctum')->postJson('/api/v1/coach/programs', [
            'client_id' => $client->id,
            'name' => 'Fuerza 12 semanas',
        ])->json();

        $mesocycle = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/programs/{$program['id']}/mesocycles", [
                'name' => 'Meso 1 - Acumulación',
                'start_week' => 1,
                'end_week' => 4,
            ])->json();

        $this->assertEqualsCanonicalizing(
            ['id', 'program_id', 'name', 'start_week', 'end_week'],
            array_keys($mesocycle)
        );

        $microcycle = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/mesocycles/{$mesocycle['id']}/microcycles", [
                'week_number' => 1,
                'focus' => 'Volumen',
            ])->json();

        $this->assertEqualsCanonicalizing(
            ['id', 'mesocycle_id', 'week_number', 'focus'],
            array_keys($microcycle)
        );

        $sessionResponse = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$microcycle['id']}/sessions", [
                'name' => 'Día 1 - Piernas',
                'day_of_week' => 'lunes',
                'exercises' => [
                    ['exercise_id' => $exercise->id, 'target_sets' => 4, 'target_reps' => 8],
                ],
            ]);

        $sessionResponse->assertCreated();
        $session = $sessionResponse->json();
        $this->assertEqualsCanonicalizing(
            ['id', 'microcycle_id', 'name', 'day_of_week', 'session_exercises'],
            array_keys($session)
        );
        $this->assertCount(1, $session['session_exercises']);
        $this->assertSame($exercise->id, $session['session_exercises'][0]['exercise']['id']);

        // El coach de otro alumno no puede ver el detalle de esta sesión.
        $otherCoach = User::factory()->create(['role' => 'coach']);
        $this->actingAs($otherCoach, 'sanctum')
            ->getJson("/api/v1/coach/sessions/{$session['id']}")
            ->assertStatus(404);

        // El propio coach sí puede.
        $showResponse = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/sessions/{$session['id']}");
        $showResponse->assertOk();
        $this->assertEqualsCanonicalizing(
            ['id', 'microcycle_id', 'name', 'day_of_week', 'session_exercises'],
            array_keys($showResponse->json())
        );

        // Listado anidado completo del programa para el alumno.
        $indexResponse = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/clients/{$client->id}/programs");
        $indexResponse->assertOk();
        $indexResponse->assertJsonPath('0.mesocycles.0.microcycles.0.workout_sessions.0.name', 'Día 1 - Piernas');
    }
}
