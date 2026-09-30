<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CoachClientTest extends TestCase
{
    use RefreshDatabase;

    private function clientPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'gender' => 'female',
            'password' => 'temporal123',
        ], $overrides);
    }

    public function test_coach_creates_client_account_assigned_to_them(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $response = $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/clients', $this->clientPayload());

        $response->assertCreated()
            ->assertJsonPath('role', 'client')
            ->assertJsonPath('force_password_change', true)
            ->assertJsonPath('needs_legal_acceptance', true);

        $client = User::where('email', 'ana@example.com')->firstOrFail();
        $this->assertDatabaseHas('coach_clients', ['coach_id' => $coach->id, 'client_id' => $client->id]);
        // El consentimiento lo da el asesorado al entrar, nunca el coach.
        $this->assertNull($client->terms_accepted_at);
        $this->assertNull($client->health_data_consent_at);
    }

    public function test_created_client_logs_in_with_temporary_password_and_must_change_it(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/clients', $this->clientPayload())
            ->assertCreated();

        $this->app['auth']->forgetGuards();

        $this->postJson('/api/v1/login', ['email' => 'ana@example.com', 'password' => 'temporal123'])
            ->assertOk()
            ->assertJsonPath('user.force_password_change', true);
    }

    public function test_create_client_validates_email_gender_and_password(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        User::factory()->create(['email' => 'ana@example.com']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/coach/clients', $this->clientPayload(['gender' => 'x', 'password' => 'corta']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'gender', 'password']);
    }

    public function test_client_cannot_create_client_accounts(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/coach/clients', $this->clientPayload())
            ->assertForbidden();
    }

    public function test_coach_resets_password_of_own_client_and_revokes_sessions(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);
        $client->createToken('auth_token');

        $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/password", ['password' => 'nueva12345'])
            ->assertOk();

        $client->refresh();
        $this->assertTrue($client->force_password_change);
        $this->assertTrue(Hash::check('nueva12345', $client->password));
        $this->assertSame(0, $client->tokens()->count());
    }

    public function test_coach_cannot_reset_password_of_another_coachs_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherCoach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $otherCoach->id, 'client_id' => $client->id]);

        $this->actingAs($coach, 'sanctum')
            ->postJson("/api/v1/coach/clients/{$client->id}/password", ['password' => 'nueva12345'])
            ->assertForbidden();
    }

    public function test_available_clients_listing_no_longer_exists(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        // Exponía nombre y correo de todos los asesorados sin coach a cualquier coach.
        $this->actingAs($coach, 'sanctum')
            ->getJson('/api/v1/coach/available-clients')
            ->assertNotFound();
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
