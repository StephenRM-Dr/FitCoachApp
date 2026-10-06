<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Indicaciones del coach para un ejercicio dentro de una sesión (p. ej.
     * "bajar lento, pausa de 1 segundo abajo"). Las ve el asesorado al
     * entrenar; no confundir con las notas que el asesorado escribe sobre su
     * propia ejecución (execution_sets.notes).
     */
    public function up(): void
    {
        Schema::table('session_exercises', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('rest_time_seconds');
        });
    }

    public function down(): void
    {
        Schema::table('session_exercises', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
