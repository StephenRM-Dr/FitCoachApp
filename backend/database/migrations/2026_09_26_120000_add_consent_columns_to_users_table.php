<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Evidencia de consentimiento: cuándo y qué versión de los términos /
     * política de privacidad aceptó el usuario, y cuándo autorizó el
     * tratamiento de sus datos de salud (dato sensible, consentimiento aparte).
     * Nullable: las cuentas previas no tienen evidencia registrada.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('terms_accepted_at')->nullable();
            $table->string('terms_version', 20)->nullable();
            $table->timestamp('health_data_consent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['terms_accepted_at', 'terms_version', 'health_data_consent_at']);
        });
    }
};
