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
        // Cubre el WHERE exacto de WeeklyPlanController::ensureCurrent()
        // (coach_id + client_id + status) sin depender de 3 índices sueltos.
        Schema::table('programs', function (Blueprint $table) {
            $table->index(['coach_id', 'client_id', 'status']);
        });

        // Soporta el ORDER BY start_week/week_number DESC LIMIT 1 que hace
        // ensureCurrent() para encontrar el mesociclo/microciclo vigente.
        Schema::table('mesocycles', function (Blueprint $table) {
            $table->index(['program_id', 'start_week']);
        });

        Schema::table('microcycles', function (Blueprint $table) {
            $table->index(['mesocycle_id', 'week_number']);
        });

        // getAvailableClients() filtra por role sin índice; a escala hace
        // table scan sobre toda la tabla de usuarios.
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex(['coach_id', 'client_id', 'status']);
        });

        Schema::table('mesocycles', function (Blueprint $table) {
            $table->dropIndex(['program_id', 'start_week']);
        });

        Schema::table('microcycles', function (Blueprint $table) {
            $table->dropIndex(['mesocycle_id', 'week_number']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });
    }
};
