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
        Schema::create('execution_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_execution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->integer('set_number');
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->integer('reps_performed')->nullable();
            $table->integer('rpe')->nullable();
            $table->integer('rir')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('execution_sets');
    }
};
