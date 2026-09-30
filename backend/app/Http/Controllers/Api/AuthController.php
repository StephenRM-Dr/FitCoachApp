<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario.
     */
    public function register(Request $request)
    {
        // El registro público es solo para coaches (con código de invitación).
        // Las cuentas de asesorado las crea su coach (POST coach/clients).
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:coach',
            'coach_code' => 'required|string',
            'gender' => 'required|in:male,female',
            'accept_terms' => 'accepted',
        ]);

        $role = 'coach';
        $expectedCode = config('fitcoach.coach_registration_code');

        if (! $expectedCode || ! hash_equals($expectedCode, (string) $request->input('coach_code'))) {
            throw ValidationException::withMessages([
                'coach_code' => ['El código de coach no es válido.'],
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $role,
            'gender' => $request->gender,
        ]);

        $user->forceFill([
            'terms_accepted_at' => now(),
            'terms_version' => config('fitcoach.legal_version'),
        ])->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Inicio de sesión.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Elimina definitivamente la cuenta del usuario autenticado y todos sus
     * datos (las FK en cascada borran perfil, anamnesis, mediciones, logs,
     * programas y ejecuciones). Exige la contraseña para que un token robado
     * no baste para destruir la cuenta. Requisito de Apple/Google.
     */
    public function deleteAccount(Request $request)
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['La contraseña no es correcta.'],
            ]);
        }

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Tu cuenta y tus datos fueron eliminados.']);
    }

    /**
     * Usuario autenticado, con sus banderas actuales (p. ej. si debe volver
     * a aceptar los términos). La app lo consulta al restaurar la sesión,
     * porque el usuario guardado en el dispositivo puede estar desactualizado.
     */
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    /**
     * Registra la aceptación de la versión vigente de los textos legales.
     * Los clientes deben además autorizar el tratamiento de datos de salud.
     */
    public function acceptLegal(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'accept_terms' => 'accepted',
            'accept_health_data' => $user->role === 'client' ? 'accepted' : 'boolean',
        ]);

        $user->forceFill([
            'terms_accepted_at' => now(),
            'terms_version' => config('fitcoach.legal_version'),
            'health_data_consent_at' => $request->boolean('accept_health_data')
                ? now()
                : $user->health_data_consent_at,
        ])->save();

        return new UserResource($user);
    }

    /**
     * Cierre de sesión.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Solicita un código de verificación de un solo uso para recuperar la
     * cuenta. No modifica la contraseña actual: pedir el reset no debe
     * poder bloquear a un usuario que no complete el segundo paso.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Respuesta idéntica exista o no la cuenta, para no permitir
        // enumerar qué correos están registrados.
        if ($user) {
            $code = (string) random_int(100000, 999999);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($code), 'created_at' => now()]
            );

            Mail::to($user->email)->send(new PasswordResetMail($code));
        }

        return response()->json([
            'message' => 'Si el correo está registrado, recibirás un código de verificación en tu bandeja de entrada.'
        ]);
    }

    /**
     * Confirma el código de verificación y autentica al usuario para que
     * pueda establecer una nueva contraseña (force_password_change). El
     * código es de un solo uso y expira a los 15 minutos; su hash es lo
     * único que se persiste.
     */
    public function confirmResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        $invalid = ! $record
            || Carbon::parse($record->created_at)->addMinutes(15)->isPast()
            || ! Hash::check($request->code, $record->token);

        if ($invalid) {
            throw ValidationException::withMessages([
                'code' => ['El código no es válido o ha expirado.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->force_password_change = true;
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Actualizar contraseña definitiva (después de recuperación).
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        // El primer cambio tras un reseteo (force_password_change) no exige
        // la contraseña actual: el usuario acaba de autenticarse con la
        // temporal. Fuera de ese flujo, sí se exige para evitar que un
        // token robado baste para tomar la cuenta permanentemente.
        $rules = ['password' => 'required|string|min:8|confirmed'];
        if (! $user->force_password_change) {
            $rules['current_password'] = 'required|string';
        }

        $request->validate($rules);

        if (! $user->force_password_change && ! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $user->password = $request->password;
        $user->force_password_change = false;
        $user->save();

        // Revoca cualquier otra sesión activa: tras un cambio de contraseña
        // solo debe sobrevivir el token actual.
        $user->tokens()
            ->where('id', '!=', $user->currentAccessToken()->id)
            ->delete();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
            'user' => new UserResource($user),
        ]);
    }
}
