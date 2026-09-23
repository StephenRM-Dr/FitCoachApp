<?php

namespace Tests\Feature\Coach;

use App\Models\CoachClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NutritionSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function coachWithAssignedClient(): array
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $client = User::factory()->create(['role' => 'client']);
        CoachClient::create(['coach_id' => $coach->id, 'client_id' => $client->id]);

        return [$coach, $client];
    }

    public function test_client_sees_disabled_defaults_when_nothing_configured_yet(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client, 'sanctum')->getJson('/api/v1/nutrition-settings');

        $response->assertOk();
        $response->assertJson([
            'user_id' => $client->id,
            'nutrition_enabled' => false,
            'macro_protein_pct' => 30,
            'macro_carbs_pct' => 45,
            'macro_fat_pct' => 25,
        ]);
    }

    public function test_coach_can_view_a_clients_settings(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($coach, 'sanctum')
            ->getJson("/api/v1/nutrition-settings?client_id={$client->id}");

        $response->assertOk();
        $this->assertSame($client->id, $response->json('user_id'));
    }

    public function test_coach_can_enable_and_configure_macros_for_assigned_client(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/clients/{$client->id}/nutrition-settings", [
                'nutrition_enabled' => true,
                'macro_protein_pct' => 35,
                'macro_carbs_pct' => 40,
                'macro_fat_pct' => 25,
            ]);

        $response->assertOk();
        $response->assertJson([
            'user_id' => $client->id,
            'nutrition_enabled' => true,
            'macro_protein_pct' => 35,
            'macro_carbs_pct' => 40,
            'macro_fat_pct' => 25,
        ]);

        $clientView = $this->actingAs($client, 'sanctum')->getJson('/api/v1/nutrition-settings');
        $clientView->assertOk();
        $clientView->assertJsonPath('nutrition_enabled', true);
    }

    public function test_coach_cannot_configure_settings_for_an_unassigned_client(): void
    {
        $coach = User::factory()->create(['role' => 'coach']);
        $otherClient = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/clients/{$otherClient->id}/nutrition-settings", [
                'nutrition_enabled' => true,
                'macro_protein_pct' => 30,
                'macro_carbs_pct' => 45,
                'macro_fat_pct' => 25,
            ]);

        $response->assertStatus(403);
    }

    public function test_macros_must_add_up_to_100_percent(): void
    {
        [$coach, $client] = $this->coachWithAssignedClient();

        $response = $this->actingAs($coach, 'sanctum')
            ->putJson("/api/v1/coach/clients/{$client->id}/nutrition-settings", [
                'nutrition_enabled' => true,
                'macro_protein_pct' => 40,
                'macro_carbs_pct' => 40,
                'macro_fat_pct' => 40,
            ]);

        $response->assertStatus(422);
    }

    public function test_client_cannot_self_enable_nutrition_via_the_coach_endpoint(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($client, 'sanctum')
            ->putJson("/api/v1/coach/clients/{$client->id}/nutrition-settings", [
                'nutrition_enabled' => true,
                'macro_protein_pct' => 30,
                'macro_carbs_pct' => 45,
                'macro_fat_pct' => 25,
            ]);

        $response->assertStatus(403);
    }
}
