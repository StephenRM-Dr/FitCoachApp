<?php

namespace Tests\Feature\Auth;

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
}
