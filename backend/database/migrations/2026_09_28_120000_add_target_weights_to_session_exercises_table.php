<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hasta 3 pesos aproximados por ejercicio (p. ej. rango ligero/medio/pesado)
     * y la unidad en que los define el coach.
     */
    public function up(): void
    {
        Schema::table('session_exercises', function (Blueprint $table) {
            $table->json('target_weights')->nullable()->after('target_reps');
            $table->string('weight_unit', 2)->default('kg')->after('target_weights');
        });
    }

    public function down(): void
    {
        Schema::table('session_exercises', function (Blueprint $table) {
            $table->dropColumn(['target_weights', 'weight_unit']);
        });
    }
};
