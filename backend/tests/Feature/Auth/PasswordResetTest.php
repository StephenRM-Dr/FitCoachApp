<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_requesting_reset_does_not_change_current_password(): void
    {
        Mail::fake();
        $user = User::factory()->create(['password' => 'original-password']);

        $response = $this->postJson('/api/v1/password/reset', ['email' => $user->email]);

        $response->assertOk();
        $this->assertTrue(Hash::check('original-password', $user->fresh()->password));
        Mail::assertSent(PasswordResetMail::class);
    }

    public function test_requesting_reset_for_unknown_email_returns_generic_message_and_sends_no_mail(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/password/reset', ['email' => 'nadie@example.com']);

        $response->assertOk();
        Mail::assertNothingSent();
    }

    public function test_confirming_valid_code_logs_in_and_forces_password_change(): void
    {
        Mail::fake();
        $user = User::factory()->create(['force_password_change' => false]);
        $this->postJson('/api/v1/password/reset', ['email' => $user->email])->assertOk();

        $capturedCode = null;
        Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use (&$capturedCode) {
            $capturedCode = $mail->code;

            return true;
        });

        $response = $this->postJson('/api/v1/password/reset/confirm', [
            'email' => $user->email,
            'code' => $capturedCode,
        ]);

        $response->assertOk();
        $response->assertJsonPath('user.force_password_change', true);
        $this->assertTrue($user->fresh()->force_password_change);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);

        $token = $response->json('access_token');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_confirming_invalid_code_fails(): void
    {
        Mail::fake();
        $user = User::factory()->create(['force_password_change' => false]);
        $this->postJson('/api/v1/password/reset', ['email' => $user->email])->assertOk();

        $response = $this->postJson('/api/v1/password/reset/confirm', [
            'email' => $user->email,
            'code' => '000000',
        ]);

        $response->assertStatus(422);
        $this->assertFalse($user->fresh()->force_password_change);
    }

    public function test_confirming_expired_code_fails(): void
    {
        Mail::fake();
        $user = User::factory()->create();
        $this->postJson('/api/v1/password/reset', ['email' => $user->email])->assertOk();

        $capturedCode = null;
        Mail::assertSent(PasswordResetMail::class, function (PasswordResetMail $mail) use (&$capturedCode) {
            $capturedCode = $mail->code;

            return true;
        });

        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update(['created_at' => now()->subMinutes(20)->toDateTimeString()]);

        $response = $this->postJson('/api/v1/password/reset/confirm', [
            'email' => $user->email,
            'code' => $capturedCode,
        ]);

        $response->assertStatus(422);
    }

    public function test_confirming_code_without_prior_request_fails(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/password/reset/confirm', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(422);
    }
}
