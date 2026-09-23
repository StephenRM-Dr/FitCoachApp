<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MicrocycleNavigationTest extends TestCase
{
    use RefreshDatabase;

    private function coachWithProgramAndMesocycle(): array
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

        return [$coach, $mesocycle];
    }

    public function test_coach_can_list_all_weeks_of_a_mesocycle_in_order(): void
    {
        [$coach, $mesocycle] = $this->coachWithProgramAndMesocycle();
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 2]);
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 3]);

        $response = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/mesocycles/{$mesocycle->id}/microcycles");

        $response->assertOk();
        $weeks = collect($response->json())->pluck('week_number')->all();
        $this->assertSame([1, 2, 3], $weeks);
        // Lista liviana: sin sesiones cargadas, no debe traer la clave.
        $this->assertArrayNotHasKey('workout_sessions', $response->json()[0]);
    }

    public function test_coach_can_go_back_to_a_previous_week_and_see_its_sessions(): void
    {
        [$coach, $mesocycle] = $this->coachWithProgramAndMesocycle();
        $week1 = Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 2]);

        $response = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/microcycles/{$week1->id}");

        $response->assertOk();
        $this->assertSame(1, $response->json('week_number'));
        $this->assertArrayHasKey('workout_sessions', $response->json());
    }

    public function test_coach_cannot_list_or_view_microcycles_of_another_coachs_mesocycle(): void
    {
        [, $mesocycle] = $this->coachWithProgramAndMesocycle();
        $microcycle = Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        $otherCoach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($otherCoach, 'sanctum')
            ->getJson("/api/v1/coach/mesocycles/{$mesocycle->id}/microcycles")
            ->assertStatus(403);

        $this->actingAs($otherCoach, 'sanctum')
            ->getJson("/api/v1/coach/microcycles/{$microcycle->id}")
            ->assertStatus(403);
    }

    /**
     * Usado por la paginación de PlanningScreen: pedir una semana puntual por
     * su número evita tener que traer el listado completo del mesociclo solo
     * para saber a qué id navegar.
     */
    public function test_coach_can_fetch_a_specific_week_by_its_week_number(): void
    {
        [$coach, $mesocycle] = $this->coachWithProgramAndMesocycle();
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        $week2 = Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 2]);

        $response = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/mesocycles/{$mesocycle->id}/microcycles/week/2");

        $response->assertOk();
        $this->assertSame($week2->id, $response->json('id'));
        $this->assertArrayHasKey('workout_sessions', $response->json());
    }

    public function test_fetching_a_nonexistent_week_number_returns_404(): void
    {
        [$coach, $mesocycle] = $this->coachWithProgramAndMesocycle();
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);

        $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/coach/mesocycles/{$mesocycle->id}/microcycles/week/9")
            ->assertStatus(404);
    }

    public function test_coach_cannot_fetch_a_week_of_another_coachs_mesocycle(): void
    {
        [, $mesocycle] = $this->coachWithProgramAndMesocycle();
        Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => 1]);
        $otherCoach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($otherCoach, 'sanctum')
            ->getJson("/api/v1/coach/mesocycles/{$mesocycle->id}/microcycles/week/1")
            ->assertStatus(403);
    }
}
