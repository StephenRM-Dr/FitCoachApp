<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoachClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_coach_can_assign_an_available_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($coach, 'sanctum')->postJson('/api/v1/coach/assign-client', [
            'client_id' => $client->id,
        ]);

        $response->assertCreated();
        $this->assertTrue(CoachClient::isAssigned($coach->id, $client->id));
    }

    public function test_coach_cannot_assign_a_client_that_already_has_a_coach(): void
    {
        $firstCoach = User::factory()->create(['role' => 'coach']);
        $secondCoach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $firstCoach->id, 'client_id' => $client->id]);

        $response = $this->actingAs($secondCoach, 'sanctum')->postJson('/api/v1/coach/assign-client', [
            'client_id' => $client->id,
        ]);

        $response->assertStatus(400);
        $this->assertTrue(CoachClient::isAssigned($firstCoach->id, $client->id));
        $this->assertFalse(CoachClient::isAssigned($secondCoach->id, $client->id));
    }

    public function test_coach_cannot_assign_a_user_that_is_not_a_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $anotherCoach = User::factory()->create(['role' => 'coach']);

        $response = $this->actingAs($coach, 'sanctum')->postJson('/api/v1/coach/assign-client', [
            'client_id' => $anotherCoach->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_available_clients_excludes_already_assigned_ones(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $assignedClient = User::factory()->create(['role' => 'client']);
        $availableClient = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $assignedClient->id]);

        $response = $this->actingAs($coach, 'sanctum')->getJson('/api/v1/coach/available-clients');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertTrue($ids->contains($availableClient->id));
        $this->assertFalse($ids->contains($assignedClient->id));
    }

    public function test_coach_only_sees_their_own_clients(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherCoach = User::factory()->create(['role' => 'coach']);
        $myClient = User::factory()->create(['role' => 'client']);
        $theirClient = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $myClient->id]);
        CoachClient::create(['coach_id' => $otherCoach->id, 'client_id' => $theirClient->id]);

        $response = $this->actingAs($coach, 'sanctum')->getJson('/api/v1/coach/my-clients');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertEqualsCanonicalizing([$myClient->id], $ids->all());
    }

    public function test_client_sees_their_assigned_coach_or_null(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $assignedClient = User::factory()->create(['role' => 'client']);
        $unassignedClient = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $assignedClient->id]);

        $this->actingAs($assignedClient, 'sanctum')
            ->getJson('/api/v1/client/my-coach')
            ->assertOk()
            ->assertJsonPath('id', $coach->id);

        $noCoachResponse = $this->actingAs($unassignedClient, 'sanctum')
            ->getJson('/api/v1/client/my-coach');
        $noCoachResponse->assertOk();
        // Laravel's TestResponse::json() trata cualquier body decodificado a
        // null como "JSON inválido" (ver TestResponse::decodeResponseJson),
        // así que se compara el contenido crudo en vez de usar ->json().
        $this->assertSame('null', $noCoachResponse->getContent());
    }
}
