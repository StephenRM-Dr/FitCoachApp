<?php

namespace Tests\Feature\Client;

use App\Models\Anthropometric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnthropometricLatestTest extends TestCase
{
    use RefreshDatabase;

    public function test_latest_fills_missing_height_with_last_known_height(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        Anthropometric::create(['user_id' => $client->id, 'weight' => 80, 'height' => 178, 'recorded_at' => now()->subWeek()]);
        Anthropometric::create(['user_id' => $client->id, 'weight' => 78, 'height' => null, 'recorded_at' => now()]);

        $response = $this->actingAs($client, 'sanctum')->getJson('/api/v1/anthropometrics/latest');

        $response->assertOk();
        $this->assertEquals(78, $response->json('weight'));
        $this->assertEquals(178, $response->json('height'));
    }

    public function test_latest_height_stays_null_when_never_recorded(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        Anthropometric::create(['user_id' => $client->id, 'weight' => 78, 'recorded_at' => now()]);

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/v1/anthropometrics/latest')
            ->assertOk()
            ->assertJsonPath('height', null);
    }
}
