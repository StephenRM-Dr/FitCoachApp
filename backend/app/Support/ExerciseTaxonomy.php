<?php

namespace App\Support;

/**
 * Vocabulario cerrado del catálogo de ejercicios (formato de
 * database/data/exercise_catalog.json). Las claves son las del JSON; las
 * etiquetas son lo que ve el coach. La app lo pide a GET exercises/taxonomy,
 * así que esta clase es la única fuente de verdad.
 */
class ExerciseTaxonomy
{
    /** Grupos amplios que se muestran y filtran en el catálogo. */
    public const GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos', 'Core', 'Movilidad'];

    /** Músculo => [etiqueta, grupo amplio]. */
    public const MUSCLES = [
        'pectoral' => ['Pectoral', 'Pecho'],
        'pectoral_superior' => ['Pectoral superior', 'Pecho'],
        'dorsal_ancho' => ['Dorsal ancho', 'Espalda'],
        'trapecio' => ['Trapecio', 'Espalda'],
        'erectores_espinales' => ['Erectores espinales', 'Espalda'],
        'deltoide' => ['Deltoides', 'Hombros'],
        'deltoide_anterior' => ['Deltoides anterior', 'Hombros'],
        'deltoide_lateral' => ['Deltoides lateral', 'Hombros'],
        'deltoide_posterior' => ['Deltoides posterior', 'Hombros'],
        'bíceps' => ['Bíceps', 'Brazos'],
        'braquial' => ['Braquial', 'Brazos'],
        'tríceps' => ['Tríceps', 'Brazos'],
        'antebrazo' => ['Antebrazo', 'Brazos'],
        'cuádriceps' => ['Cuádriceps', 'Piernas'],
        'femoral' => ['Femoral (isquiotibiales)', 'Piernas'],
        'aductores' => ['Aductores', 'Piernas'],
        'gastrocnemio' => ['Gastrocnemio', 'Piernas'],
        'soleo' => ['Sóleo', 'Piernas'],
        'tibial_anterior' => ['Tibial anterior', 'Piernas'],
        'glúteo' => ['Glúteo', 'Glúteos'],
        'glúteo_medio' => ['Glúteo medio', 'Glúteos'],
        'core' => ['Core', 'Core'],
        'oblicuos' => ['Oblicuos', 'Core'],
    ];

    public const PATTERNS = [
        'sentadilla' => 'Sentadilla',
        'bisagra_cadera' => 'Bisagra de cadera',
        'unilateral' => 'Unilateral',
        'empuje_horizontal' => 'Empuje horizontal',
        'empuje_vertical' => 'Empuje vertical',
        'traccion_horizontal' => 'Tracción horizontal',
        'traccion_vertical' => 'Tracción vertical',
        'core' => 'Core',
        'movilidad' => 'Movilidad',
    ];

    public const EQUIPMENT = [
        'peso_corporal' => 'Peso corporal',
        'mancuerna' => 'Mancuerna',
        'barra' => 'Barra',
        'maquina' => 'Máquina',
        'polea' => 'Polea',
        'kettlebell' => 'Kettlebell',
        'banda' => 'Banda elástica',
    ];

    public const LEVELS = [
        'bajo' => 'Bajo',
        'medio' => 'Medio',
        'alto' => 'Alto',
    ];

    /**
     * Grupo amplio del ejercicio: los de movilidad van a "Movilidad"; el
     * resto, al grupo de su primer músculo primario (el principal).
     */
    public static function groupFor(?string $pattern, array $primaryMuscles): string
    {
        if ($pattern === 'movilidad') {
            return 'Movilidad';
        }

        $main = $primaryMuscles[0] ?? null;

        return self::MUSCLES[$main][1] ?? 'Core';
    }

    /** Forma que consume la app: listas ordenadas {key, label}. */
    public static function toArray(): array
    {
        $pairs = fn (array $map) => collect($map)
            ->map(fn ($label, $key) => ['key' => $key, 'label' => $label])
            ->values()
            ->all();

        return [
            'groups' => self::GROUPS,
            'muscles' => collect(self::MUSCLES)
                ->map(fn ($m, $key) => ['key' => $key, 'label' => $m[0], 'group' => $m[1]])
                ->values()
                ->all(),
            'patterns' => $pairs(self::PATTERNS),
            'equipment' => $pairs(self::EQUIPMENT),
            'levels' => $pairs(self::LEVELS),
        ];
    }
}
