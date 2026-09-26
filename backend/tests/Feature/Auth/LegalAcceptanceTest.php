<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Re-consentimiento: cuando cambia la versión de los textos legales (o la
 * cuenta es anterior al registro de consentimiento) la app debe pedir la
 * aceptación de nuevo antes de dejar usar el resto.
 */
class LegalAcceptanceTest extends TestCase
{
    use RefreshDatabase;

    private function consented(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'client',
            'terms_accepted_at' => now(),
            'terms_version' => config('fitcoach.legal_version'),
            'health_data_consent_at' => now(),
        ], $overrides));
    }

    public function test_legacy_account_without_consent_evidence_needs_acceptance(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('needs_legal_acceptance', true);
    }

    public function test_up_to_date_client_does_not_need_acceptance(): void
    {
        $this->actingAs($this->consented(), 'sanctum')
            ->getJson('/api/v1/me')
            ->assertJsonPath('needs_legal_acceptance', false);
    }

    public function test_outdated_version_needs_acceptance(): void
    {
        $user = $this->consented(['terms_version' => '0.9']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/me')
            ->assertJsonPath('needs_legal_acceptance', true);
    }

    public function test_client_without_health_consent_needs_acceptance_but_coach_does_not(): void
    {
        $client = $this->consented(['health_data_consent_at' => null]);
        $coach = $this->consented(['role' => 'coach', 'health_data_consent_at' => null]);

        $this->actingAs($client, 'sanctum')->getJson('/api/v1/me')
            ->assertJsonPath('needs_legal_acceptance', true);
        $this->actingAs($coach, 'sanctum')->getJson('/api/v1/me')
            ->assertJsonPath('needs_legal_acceptance', false);
    }

    public function test_client_can_accept_and_evidence_is_stored(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/legal/accept', ['accept_terms' => true, 'accept_health_data' => true])
            ->assertOk()
            ->assertJsonPath('needs_legal_acceptance', false);

        $user->refresh();
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertNotNull($user->health_data_consent_at);
        $this->assertSame(config('fitcoach.legal_version'), $user->terms_version);
    }

    public function test_acceptance_requires_terms_and_clients_also_health_consent(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/legal/accept', ['accept_health_data' => true])
            ->assertStatus(422)->assertJsonValidationErrors(['accept_terms']);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/legal/accept', ['accept_terms' => true])
            ->assertStatus(422)->assertJsonValidationErrors(['accept_health_data']);

        $this->assertNull($client->fresh()->terms_accepted_at);
    }

    public function test_coach_accepts_with_terms_only(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/legal/accept', ['accept_terms' => true])
            ->assertOk()
            ->assertJsonPath('needs_legal_acceptance', false);

        $this->assertNull($coach->fresh()->health_data_consent_at);
    }

    public function test_acceptance_requires_authentication(): void
    {
        $this->postJson('/api/v1/legal/accept', ['accept_terms' => true])->assertUnauthorized();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }
}
