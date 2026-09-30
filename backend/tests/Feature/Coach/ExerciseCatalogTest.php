<?php

namespace Tests\Feature\Coach;

use App\Models\Exercise;
use App\Models\User;
use Database\Seeders\ExerciseCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function exercisePayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Remo con pecho apoyado',
            'pattern' => 'traccion_horizontal',
            'primary_muscles' => ['dorsal_ancho', 'trapecio'],
            'secondary_muscles' => ['bíceps'],
            'equipment' => 'mancuerna',
            'level' => 'bajo',
            'contraindications' => ['flexion_lumbar_compensatoria'],
            'technical_cues' => ['pecho pegado al banco'],
            'notes' => 'preferible si hay molestia lumbar',
        ], $overrides);
    }

    public function test_taxonomy_lists_groups_muscles_and_options(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $response = $this->actingAs($coach, 'sanctum')->getJson('/api/v1/exercises/taxonomy');

        $response->assertOk();
        $this->assertContains('Glúteos', $response->json('groups'));
        $this->assertContains(
            ['key' => 'dorsal_ancho', 'label' => 'Dorsal ancho', 'group' => 'Espalda'],
            $response->json('muscles'),
        );
        $this->assertContains(['key' => 'maquina', 'label' => 'Máquina'], $response->json('equipment'));
    }

    public function test_coach_creates_exercise_in_catalog_format_with_computed_group(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/exercises', $this->exercisePayload());

        $response->assertCreated()
            ->assertJsonPath('muscle_group', 'Espalda')
            ->assertJsonPath('primary_muscles', ['dorsal_ancho', 'trapecio'])
            ->assertJsonPath('technical_cues', ['pecho pegado al banco'])
            ->assertJsonPath('coach_id', $coach->id);
        $this->assertStringStartsWith('remo-con-pecho-apoyado-c', $response->json('slug'));
    }

    public function test_mobility_pattern_groups_as_movilidad(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/exercises', $this->exercisePayload([
                'name' => 'Movilidad de cadera 90/90',
                'pattern' => 'movilidad',
                'primary_muscles' => ['glúteo'],
            ]))
            ->assertCreated()
            ->assertJsonPath('muscle_group', 'Movilidad');
    }

    public function test_rejects_values_outside_the_vocabulary(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/exercises', $this->exercisePayload([
                'pattern' => 'saltos',
                'primary_muscles' => ['pantorrilla'],
                'equipment' => 'trx',
                'level' => 'experto',
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['pattern', 'primary_muscles.0', 'equipment', 'level']);
    }

    public function test_primary_muscles_are_required(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/exercises', $this->exercisePayload(['primary_muscles' => []]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['primary_muscles']);
    }

    public function test_catalog_seeder_is_idempotent_and_completes_existing_exercises(): void
    {
        // Ejercicio anterior al formato: sin slug, con imagen subida.
        $legacy = Exercise::create(['name' => 'Press de Banca', 'muscle_group' => 'Pecho']);
        $legacy->forceFill(['image_url' => 'exercises/press.gif'])->save();
        $custom = Exercise::create(['coach_id' => User::factory()->create(['role' => 'coach'])->id, 'name' => 'Propio', 'muscle_group' => 'Core']);

        $this->seed(ExerciseCatalogSeeder::class);
        $this->seed(ExerciseCatalogSeeder::class);

        $catalogSize = count(json_decode(file_get_contents(database_path('data/exercise_catalog.json')), true)['ejercicios']);
        $this->assertSame($catalogSize, Exercise::whereNull('coach_id')->count());

        $legacy->refresh();
        $this->assertSame('press-banca', $legacy->slug);
        $this->assertSame(['pectoral'], $legacy->primary_muscles);
        $this->assertSame('exercises/press.gif', $legacy->image_url);

        $this->assertSame('Propio', $custom->fresh()->name);

        $this->assertSame('Movilidad', Exercise::where('slug', 'movilidad-tobillo-pared')->value('muscle_group'));
        $this->assertSame('Glúteos', Exercise::where('slug', 'hip-thrust-barra')->value('muscle_group'));
    }
}
