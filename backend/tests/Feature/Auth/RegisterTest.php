<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'gender' => 'male',
            'accept_terms' => true,
            'accept_health_data' => true,
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

    public function test_client_registration_requires_health_data_consent(): void
    {
        $this->postJson('/api/v1/register', $this->validPayload(['accept_health_data' => false]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['accept_health_data']);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_stores_consent_evidence(): void
    {
        $this->postJson('/api/v1/register', $this->validPayload())->assertCreated();

        $user = User::where('email', 'juan@example.com')->firstOrFail();

        $this->assertNotNull($user->terms_accepted_at);
        $this->assertNotNull($user->health_data_consent_at);
        $this->assertSame(config('fitcoach.legal_version'), $user->terms_version);
    }
}
