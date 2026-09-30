<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Campos del formato de catálogo (database/data/exercise_catalog.json).
     * muscle_group se conserva: pasa a ser el grupo amplio calculado a
     * partir de los músculos primarios (ver ExerciseTaxonomy::groupFor).
     */
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->string('slug', 120)->nullable()->unique()->after('coach_id');
            $table->string('pattern', 40)->nullable()->after('muscle_group');
            $table->json('primary_muscles')->nullable()->after('pattern');
            $table->json('secondary_muscles')->nullable()->after('primary_muscles');
            $table->string('equipment', 40)->nullable()->after('secondary_muscles');
            $table->string('level', 10)->nullable()->after('equipment');
            $table->json('contraindications')->nullable()->after('level');
            $table->json('technical_cues')->nullable()->after('contraindications');
            $table->text('notes')->nullable()->after('technical_cues');
        });
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn([
                'slug', 'pattern', 'primary_muscles', 'secondary_muscles', 'equipment',
                'level', 'contraindications', 'technical_cues', 'notes',
            ]);
        });
    }
};
