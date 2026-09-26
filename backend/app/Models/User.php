<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'gender'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'force_password_change' => 'boolean',
        ];
    }

    /**
     * ¿Debe volver a aceptar los textos legales? Sí si nunca los aceptó
     * (cuenta anterior al registro de consentimiento), si cambió la versión
     * vigente, o si es cliente y no autorizó el tratamiento de datos de salud.
     */
    public function needsLegalAcceptance(): bool
    {
        if ($this->terms_version !== config('fitcoach.legal_version')) {
            return true;
        }

        return $this->role === 'client' && $this->health_data_consent_at === null;
    }

    /**
     * Asignaciones de clientes cuando este usuario es coach.
     */
    public function clientAssignments()
    {
        return $this->hasMany(CoachClient::class, 'coach_id');
    }

    /**
     * Asignación a un coach cuando este usuario es cliente (máx. una).
     */
    public function coachAssignment()
    {
        return $this->hasOne(CoachClient::class, 'client_id');
    }

    /**
     * Datos de perfil (edad, ocupación, nivel de actividad, objetivo).
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }
}
