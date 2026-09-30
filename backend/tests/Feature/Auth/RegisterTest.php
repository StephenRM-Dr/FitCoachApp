<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['fitcoach.coach_registration_code' => 'CODIGO-COACH']);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'gender' => 'male',
            'role' => 'coach',
            'coach_code' => 'CODIGO-COACH',
            'accept_terms' => true,
        ], $overrides);
    }

    public function test_registration_requires_gender(): void
    {
        $payload = $this->validPayload();
        unset($payload['gender']);

        $response = $this->postJson('/api/v1/register', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gender']);
    }

    public function test_registration_rejects_invalid_gender(): void
    {
        $response = $this->postJson(
            '/api/v1/register',
            $this->validPayload(['gender' => 'other']),
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gender']);
    }

    public function test_registration_accepts_male_or_female_and_returns_it(): void
    {
        $response = $this->postJson(
            '/api/v1/register',
            $this->validPayload(['email' => 'female@example.com', 'gender' => 'female']),
        );

        $response->assertCreated();
        $this->assertSame('female', $response->json('user.gender'));
    }

    public function test_registration_requires_terms_acceptance(): void
    {
        $payload = $this->validPayload();
        unset($payload['accept_terms']);

        $this->postJson('/api/v1/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['accept_terms']);

        $this->postJson('/api/v1/register', $this->validPayload(['accept_terms' => false]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['accept_terms']);
    }

    public function test_clients_cannot_self_register(): void
    {
        // Las cuentas de asesorado las crea su coach (POST coach/clients).
        $this->postJson('/api/v1/register', $this->validPayload(['role' => 'client']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['role']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_requires_valid_coach_code(): void
    {
        $this->postJson('/api/v1/register', $this->validPayload(['coach_code' => 'otro']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['coach_code']);

        $payload = $this->validPayload();
        unset($payload['coach_code']);
        $this->postJson('/api/v1/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['coach_code']);
    }

    public function test_registration_stores_consent_evidence(): void
    {
        $this->postJson('/api/v1/register', $this->validPayload())->assertCreated();

        $user = User::where('email', 'juan@example.com')->firstOrFail();

        $this->assertSame('coach', $user->role);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertSame(config('fitcoach.legal_version'), $user->terms_version);
    }
}
