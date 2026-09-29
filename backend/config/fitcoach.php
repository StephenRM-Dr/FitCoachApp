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

    /*
    |--------------------------------------------------------------------------
    | Versión de los documentos legales
    |--------------------------------------------------------------------------
    |
    | Versión vigente de los Términos y la Política de Privacidad. Se guarda
    | junto con la fecha de aceptación como evidencia de consentimiento.
    | Súbela cuando cambie el texto legal en mobile/src/legal.
    |
    */

    'legal_version' => '1.1',

    /*
    |--------------------------------------------------------------------------
    | Disco de imágenes del catálogo de ejercicios
    |--------------------------------------------------------------------------
    |
    | "public" guarda en disco local (desarrollo). En producción usa "r2"
    | (Cloudflare R2 / cualquier S3 compatible): los hosts modernos borran el
    | disco local en cada deploy, y las imágenes desaparecerían.
    |
    */

    'media_disk' => env('EXERCISE_MEDIA_DISK', 'public'),

];
