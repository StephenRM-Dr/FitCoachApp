<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Services\TextCleaner;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    /**
     * Resuelve la pareja coach/cliente de la conversación del usuario
     * autenticado. El coach debe indicar con qué alumno (client_id); el
     * cliente siempre conversa con su único coach asignado.
     */
    private function resolveConversation(Request $request): array
    {
        $user = $request->user();

        if ($user->role === 'coach') {
            $request->validate(['client_id' => 'required|integer']);
            $clientId = (int) $request->input('client_id');
            $this->authorizeCoachOwnsClient($request, $clientId);

            return ['coach_id' => $user->id, 'client_id' => $clientId];
        }

        $assignment = $user->coachAssignment;
        if (! $assignment) {
            abort(404, 'Todavía no tienes un coach asignado.');
        }

        return ['coach_id' => $assignment->coach_id, 'client_id' => $user->id];
    }

    /**
     * @group Chat
     * Lista los mensajes de la conversación coach-alumno, más recientes
     * primero (para calzar con una lista invertida en el cliente).
     */
    public function index(Request $request)
    {
        $conversation = $this->resolveConversation($request);
        $perPage = min(max($request->integer('per_page', 30), 1), 50);

        $messages = Message::where('coach_id', $conversation['coach_id'])
            ->where('client_id', $conversation['client_id'])
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return MessageResource::collection($messages);
    }

    /**
     * @group Chat
     * Envía un mensaje en la conversación coach-alumno.
     */
    public function store(Request $request)
    {
        $conversation = $this->resolveConversation($request);
        $validated = $request->validate(['body' => 'required|string|max:2000']);

        $body = TextCleaner::sanitize($validated['body']);
        if ($body === '') {
            throw ValidationException::withMessages(['body' => ['El mensaje no puede estar vacío.']]);
        }

        $message = Message::create([
            'coach_id' => $conversation['coach_id'],
            'client_id' => $conversation['client_id'],
            'sender_id' => $request->user()->id,
            'body' => $body,
        ]);

        return (new MessageResource($message))->response()->setStatusCode(201);
    }
}
