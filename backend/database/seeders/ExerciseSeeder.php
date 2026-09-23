<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exercises = [
            ['name' => 'Sentadilla Libre', 'muscle_group' => 'Piernas', 'description' => 'Flexión de rodillas y cadera con peso libre.'],
            ['name' => 'Press de Banca', 'muscle_group' => 'Pecho', 'description' => 'Empuje horizontal en banco plano.'],
            ['name' => 'Peso Muerto', 'muscle_group' => 'Espalda Baja/Isquios', 'description' => 'Levantamiento de peso desde el suelo hasta la extensión de cadera.'],
            ['name' => 'Dominadas', 'muscle_group' => 'Espalda', 'description' => 'Tracción vertical con peso corporal.'],
            ['name' => 'Press Militar', 'muscle_group' => 'Hombros', 'description' => 'Empuje vertical por encima de la cabeza.'],
            ['name' => 'Remo con Barra', 'muscle_group' => 'Espalda', 'description' => 'Tracción horizontal con barra.'],
        ];

        foreach ($exercises as $exercise) {
            \App\Models\Exercise::create($exercise);
        }
    }
}
