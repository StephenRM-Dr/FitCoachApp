<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Código de registro de coaches
    |--------------------------------------------------------------------------
    |
    | El registro público siempre crea usuarios con rol "client". Para
    | registrarse como coach se exige este código de invitación. Si es null,
    | el registro como coach queda deshabilitado por completo.
    |
    */

    'coach_registration_code' => env('COACH_REGISTRATION_CODE'),

];
