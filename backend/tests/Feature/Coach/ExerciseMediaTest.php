<?php

namespace Tests\Feature\Coach;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExerciseMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_coach_can_upload_an_image_for_a_catalog_exercise(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);
        $file = UploadedFile::fake()->image('sentadilla.gif', 200, 200)->size(500);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/exercises/{$exercise->id}/media", ['image' => $file]);

        $response->assertOk();
        $this->assertNotNull($response->json('image_url'));

        // El modelo guarda solo la ruta relativa: la URL absoluta se arma en
        // el Resource a partir del host de la request, no de APP_URL — así
        // funciona igual detrás de un túnel ngrok cuyo host cambia y no
        // coincide con APP_URL del backend.
        $exercise->refresh();
        $this->assertNotNull($exercise->image_url);
        $this->assertStringStartsNotWith('http', $exercise->image_url);
        Storage::disk('public')->assertExists($exercise->image_url);
    }

    public function test_client_cannot_upload_exercise_media(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);
        $file = UploadedFile::fake()->image('sentadilla.png');

        $response = $this->actingAs($client, 'sanctum')
            ->postJson("/api/v1/coach/exercises/{$exercise->id}/media", ['image' => $file]);

        $response->assertStatus(403);
    }

    public function test_rejects_files_over_the_size_limit(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);
        $file = UploadedFile::fake()->image('sentadilla.gif')->size(6000); // 6MB > 5MB

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/exercises/{$exercise->id}/media", ['image' => $file]);

        $response->assertStatus(422);
    }

    public function test_rejects_disallowed_file_types(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $exercise = Exercise::create(['name' => 'Sentadilla', 'muscle_group' => 'piernas']);
        $file = UploadedFile::fake()->create('rutina.pdf', 100, 'application/pdf');

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/exercises/{$exercise->id}/media", ['image' => $file]);

        $response->assertStatus(422);
    }
}
