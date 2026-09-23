<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nutrition_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->boolean('nutrition_enabled')->default(false);
            $table->unsignedTinyInteger('macro_protein_pct')->default(30);
            $table->unsignedTinyInteger('macro_carbs_pct')->default(45);
            $table->unsignedTinyInteger('macro_fat_pct')->default(25);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutrition_settings');
    }
};
