<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Support\ExerciseTaxonomy;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Sincroniza el catálogo global con database/data/exercise_catalog.json.
 * Es idempotente (se ejecuta en cada despliegue, ver railway.json): busca por
 * slug y, la primera vez, por nombre, para completar los ejercicios que ya
 * existían en vez de duplicarlos. No toca image_url ni description, ni los
 * ejercicios personalizados de los coaches.
 */
class ExerciseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = json_decode(
            file_get_contents(database_path('data/exercise_catalog.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        foreach ($catalog['ejercicios'] as $item) {
            $this->assertKnownValues($item);

            $exercise = Exercise::whereNull('coach_id')->where('slug', $item['slug'])->first()
                ?? Exercise::whereNull('coach_id')->whereNull('slug')->where('name', $item['nombre'])->first()
                ?? new Exercise;

            $exercise->fill([
                'slug' => $item['slug'],
                'name' => $item['nombre'],
                'pattern' => $item['patron'],
                'muscle_group' => ExerciseTaxonomy::groupFor($item['patron'], $item['musculos_primarios']),
                'primary_muscles' => $item['musculos_primarios'],
                'secondary_muscles' => $item['musculos_secundarios'] ?? [],
                'equipment' => $item['equipamiento'],
                'level' => $item['nivel'],
                'contraindications' => $item['contraindicaciones'] ?? [],
                'technical_cues' => $item['cues_tecnicos'] ?? [],
                'notes' => $item['notas'] ?? null,
            ])->save();
        }
    }

    /**
     * Un valor fuera del vocabulario (typo en el JSON) rompe el despliegue en
     * vez de colar un músculo o patrón que la app no sabe mostrar.
     */
    private function assertKnownValues(array $item): void
    {
        $unknown = array_merge(
            array_diff([...$item['musculos_primarios'], ...($item['musculos_secundarios'] ?? [])], array_keys(ExerciseTaxonomy::MUSCLES)),
            array_diff([$item['patron']], array_keys(ExerciseTaxonomy::PATTERNS)),
            array_diff([$item['equipamiento']], array_keys(ExerciseTaxonomy::EQUIPMENT)),
            array_diff([$item['nivel']], array_keys(ExerciseTaxonomy::LEVELS)),
        );

        if ($unknown) {
            throw new RuntimeException("Ejercicio {$item['slug']}: valores desconocidos: ".implode(', ', $unknown));
        }
    }
}
