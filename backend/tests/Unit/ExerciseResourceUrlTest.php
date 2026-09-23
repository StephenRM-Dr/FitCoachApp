<?php

namespace Tests\Unit;

use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * ExerciseResource arma la URL absoluta de la imagen a partir del host de la
 * request entrante, no de APP_URL — así el link sirve igual detrás de un
 * túnel ngrok o una IP de LAN, cuyo host normalmente no coincide con el
 * APP_URL configurado en el backend.
 */
class ExerciseResourceUrlTest extends TestCase
{
    public function test_image_url_is_built_from_the_request_host(): void
    {
        $exercise = new Exercise([
            'name' => 'Sentadilla libre',
            'muscle_group' => 'piernas',
        ]);
        $exercise->image_url = 'exercises/abc123.gif';

        // URI relativa a propósito: si fuera absoluta, Request::create()
        // ignoraría el HTTP_HOST del $server y lo reemplazaría por el host
        // parseado de la URL (así arma las URLs Laravel en los tests HTTP).
        $request = Request::create('/api/v1/exercises', 'GET', [], [], [], [
            'HTTP_HOST' => 'sift-aptly-waggle.ngrok-free.dev',
        ]);

        $data = (new ExerciseResource($exercise))->toArray($request);

        $this->assertSame(
            'http://sift-aptly-waggle.ngrok-free.dev/storage/exercises/abc123.gif',
            $data['image_url'],
        );
    }

    public function test_image_url_is_null_when_exercise_has_no_image(): void
    {
        $exercise = new Exercise(['name' => 'Plancha', 'muscle_group' => 'core']);
        $request = Request::create('/api/v1/exercises');

        $data = (new ExerciseResource($exercise))->toArray($request);

        $this->assertNull($data['image_url']);
    }
}
