<?php

namespace Tests\Feature;

use App\Models\CoachClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    private function pair(): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);

        return [$coach, $client];
    }

    public function test_coach_can_send_and_list_messages_with_assigned_client(): void
    {
        [$coach, $client] = $this->pair();

        $send = $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/messages', ['client_id' => $client->id, 'body' => 'Hola, ¿cómo vas con la rutina?']);

        $send->assertCreated();
        $this->assertSame($coach->id, $send->json('sender_id'));

        $list = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/messages?client_id={$client->id}");

        $list->assertOk();
        $this->assertCount(1, $list->json('data'));
        $this->assertSame('Hola, ¿cómo vas con la rutina?', $list->json('data.0.body'));
    }

    public function test_client_can_send_and_list_messages_with_their_coach(): void
    {
        [$coach, $client] = $this->pair();

        $send = $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/messages', ['body' => 'Todo bien, gracias']);

        $send->assertCreated();
        $this->assertSame($client->id, $send->json('sender_id'));
        $this->assertSame($coach->id, $send->json('coach_id'));

        $list = $this->actingAs($client, 'sanctum')->getJson('/api/v1/messages');

        $list->assertOk();
        $this->assertCount(1, $list->json('data'));
    }

    public function test_coach_cannot_message_unrelated_client(): void
    {
        [, $client] = $this->pair();
        $otherCoach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($otherCoach, 'sanctum')
            ->postJson('/api/v1/messages', ['client_id' => $client->id, 'body' => 'hola'])
            ->assertStatus(403);

        $this->actingAs($otherCoach, 'sanctum')
            ->getJson("/api/v1/messages?client_id={$client->id}")
            ->assertStatus(403);
    }

    public function test_coach_must_provide_client_id(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/messages', ['body' => 'hola'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['client_id']);
    }

    public function test_message_body_cannot_be_empty_after_sanitizing(): void
    {
        [$coach, $client] = $this->pair();

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/messages', ['client_id' => $client->id, 'body' => '   <b></b>   '])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_message_body_cannot_exceed_max_length(): void
    {
        [$coach, $client] = $this->pair();

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/messages', ['client_id' => $client->id, 'body' => str_repeat('a', 2001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    }

    public function test_client_without_coach_assignment_gets_404(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client, 'sanctum')->getJson('/api/v1/messages')->assertStatus(404);
        $this->actingAs($client, 'sanctum')
            ->postJson('/api/v1/messages', ['body' => 'hola'])
            ->assertStatus(404);
    }

    public function test_successful_send_persists_exactly_one_row(): void
    {
        [$coach, $client] = $this->pair();

        $this->actingAs($coach, 'sanctum')
            ->postJson('/api/v1/messages', ['client_id' => $client->id, 'body' => 'hola']);

        $this->assertDatabaseCount('messages', 1);
    }
}
