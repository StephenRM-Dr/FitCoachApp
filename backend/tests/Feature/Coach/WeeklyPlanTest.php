<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\Exercise;
use App\Models\Microcycle;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeeklyPlanTest extends TestCase
{
    use RefreshDatabase;

    private function coachWithAssignedClient(): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);

        return [$coach, $client];
    }

    public function test_coach_cannot_provision_plan_for_unassigned_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherClient = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$otherClient->id}/weekly-plan");

        $response->assertStatus(403);
    }

    public function test_first_call_provisions_program_mesocycle_and_microcycle(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan");

        $response->assertOk();
        $this->assertNotNull($response->json('program_id'));
        $this->assertNotNull($response->json('mesocycle_id'));
        $this->assertSame(1, $response->json('microcycle.week_number'));

        $this->assertDatabaseCount('programs', 1);
        $this->assertDatabaseCount('mesocycles', 1);
        $this->assertDatabaseCount('microcycles', 1);
    }

    public function test_calling_it_again_is_idempotent_and_does_not_duplicate(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $first = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan")
            ->json();

        $second = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan")
            ->json();

        $this->assertSame($first['program_id'], $second['program_id']);
        $this->assertSame($first['mesocycle_id'], $second['mesocycle_id']);
        $this->assertSame($first['microcycle']['id'], $second['microcycle']['id']);

        $this->assertDatabaseCount('programs', 1);
        $this->assertDatabaseCount('mesocycles', 1);
        $this->assertDatabaseCount('microcycles', 1);
    }

    public function test_returns_the_highest_week_number_microcycle_if_one_already_exists(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $first = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan")
            ->json();

        // Simula que el coach ya avanzó a la semana 2 manualmente.
        Microcycle::create([
            'mesocycle_id' => $first['mesocycle_id'],
            'week_number' => 2,
        ]);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan");

        $response->assertOk();
        $this->assertSame(2, $response->json('microcycle.week_number'));
        $this->assertDatabaseCount('microcycles', 2);
    }

    public function test_rejects_invalid_day_of_week_on_session_creation(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();
        $plan = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan")
            ->json();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$plan['microcycle']['id']}/sessions", [
                'name' => 'Sesión inválida',
                'day_of_week' => 'funday',
                'exercises' => [
                    ['exercise_id' => $exercise->id],
                ],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['day_of_week']);
    }

    public function test_accepts_a_valid_day_of_week_on_session_creation(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();
        $plan = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/weekly-plan")
            ->json();
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/microcycles/{$plan['microcycle']['id']}/sessions", [
                'name' => 'Piernas',
                'day_of_week' => 'martes',
                'exercises' => [
                    ['exercise_id' => $exercise->id],
                ],
            ]);

        $response->assertCreated();
        $this->assertSame('martes', $response->json('day_of_week'));
    }
}
