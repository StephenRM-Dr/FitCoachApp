<?php

namespace App\Services;

class TextCleaner
{
    /**
     * Sanea el texto de entrada eliminando etiquetas HTML,
     * espacios innecesarios y normalizando caracteres.
     */
    public static function sanitize(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // Eliminar etiquetas HTML y PHP
        $text = strip_tags($text);
        
        // Eliminar espacios al inicio y final
        $text = trim($text);
        
        // Convertir múltiples espacios en uno solo
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Convertir caracteres especiales a entidades HTML para mayor seguridad (opcional, dependiendo de la necesidad)
        // $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

        return $text;
    }
}
