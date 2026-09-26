<?php

namespace Tests\Feature\Auth;

use App\Models\Anthropometric;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_delete_own_account_with_correct_password(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass-123']);
        Anthropometric::create(['user_id' => $user->id, 'weight' => 70, 'recorded_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withToken($token)
            ->deleteJson('/api/v1/account', ['password' => 'secret-pass-123'])
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('anthropometrics', ['user_id' => $user->id]);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_deletion_is_rejected_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/account', ['password' => 'wrong-password'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_deletion_requires_password_field(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/account')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_deletion_requires_authentication(): void
    {
        $this->deleteJson('/api/v1/account', ['password' => 'x'])->assertUnauthorized();
    }

    public function test_deleting_a_coach_does_not_delete_other_users(): void
    {
        $coach = User::factory()->create(['role' => 'coach', 'password' => 'secret-pass-123']);
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($coach, 'sanctum')
            ->deleteJson('/api/v1/account', ['password' => 'secret-pass-123'])
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $coach->id]);
        $this->assertDatabaseHas('users', ['id' => $client->id]);
    }
}
