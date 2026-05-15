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
        Schema::create('microcycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mesocycle_id')->constrained()->cascadeOnDelete();
            $table->integer('week_number');
            $table->string('focus', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('microcycles');
    }
};
