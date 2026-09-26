<?php

namespace Tests\Feature\Client;

use App\Models\Exercise;
use App\Models\Mesocycle;
use App\Models\Microcycle;
use App\Models\Program;
use App\Models\SessionExercise;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Presupuesto de consultas de los endpoints más calientes del cliente. El
 * objetivo es que el número de queries NO crezca con el tamaño de los datos
 * (semanas, series): cada consulta es un viaje de red a Neon.
 */
class QueryBudgetTest extends TestCase
{
    use RefreshDatabase;

    private function programWithWeeks(User $client, int $weeks): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $program = Program::create([
            'coach_id' => $coach->id, 'client_id' => $client->id,
            'name' => 'Plan', 'status' => 'active',
        ]);
        $mesocycle = Mesocycle::create([
            'program_id' => $program->id, 'name' => 'Meso 1', 'start_week' => 1, 'end_week' => 12,
        ]);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);

        $lastSession = null;
        for ($week = 1; $week <= $weeks; $week++) {
            $micro = Microcycle::create(['mesocycle_id' => $mesocycle->id, 'week_number' => $week]);
            foreach (range(1, 4) as $day) {
                $session = WorkoutSession::create([
                    'microcycle_id' => $micro->id, 'name' => "Semana {$week} día {$day}", 'day_of_week' => $day,
                ]);
                foreach (range(1, 6) as $order) {
                    SessionExercise::create([
                        'workout_session_id' => $session->id, 'exercise_id' => $exercise->id,
                        'sets' => 3, 'reps' => '10', 'order' => $order,
                    ]);
                }
                $lastSession = $session;
            }
        }

        return [$program, $lastSession, $exercise];
    }

    private function countQueries(callable $callback): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $callback();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    }

    public function test_active_program_returns_only_the_current_week(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $this->programWithWeeks($client, 5);

        $response = $this->actingAs($client, 'sanctum')->getJson('/api/v1/client/programs/active');

        $response->assertOk();
        $this->assertCount(1, $response->json('mesocycles'));
        $microcycles = $response->json('mesocycles.0.microcycles');
        $this->assertCount(1, $microcycles);
        $this->assertSame(5, $microcycles[0]['week_number']);
        $this->assertCount(4, $microcycles[0]['workout_sessions']);
    }

    public function test_active_program_query_count_does_not_grow_with_weeks(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $this->programWithWeeks($client, 12);
        $this->actingAs($client, 'sanctum');

        $queries = $this->countQueries(
            fn () => $this->getJson('/api/v1/client/programs/active')->assertOk()
        );

        // auth + programa + mesociclo + microciclo + sesiones + ejercicios de sesión + catálogo
        $this->assertLessThanOrEqual(8, $queries, "activeProgram usó {$queries} queries");
    }

    public function test_store_execution_query_count_does_not_grow_with_sets(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        [, $session, $exercise] = $this->programWithWeeks($client, 1);
        $this->actingAs($client, 'sanctum');

        $sets = collect(range(1, 30))->map(fn ($n) => [
            'exercise_id' => $exercise->id, 'set_number' => $n,
            'weight_kg' => 50, 'reps_performed' => 10, 'rpe' => 8, 'rir' => 2,
        ])->all();

        $queries = $this->countQueries(fn () => $this->postJson('/api/v1/client/executions', [
            'workout_session_id' => $session->id,
            'sets' => $sets,
        ])->assertCreated());

        $this->assertDatabaseCount('execution_sets', 30);
        $this->assertLessThanOrEqual(12, $queries, "storeExecution usó {$queries} queries con 30 series");
    }

    public function test_history_page_size_is_capped(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/client/executions/history?per_page=100000');

        $response->assertOk();
        $this->assertLessThanOrEqual(50, $response->json('meta.per_page'));
    }
}
