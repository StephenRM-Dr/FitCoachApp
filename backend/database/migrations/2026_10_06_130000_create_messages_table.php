<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            // La lista se filtra siempre por esta pareja, ordenada por recencia.
            $table->index(['coach_id', 'client_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
