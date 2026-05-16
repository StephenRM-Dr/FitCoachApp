# Guía de Diagnóstico: Mesociclos y Ejercicios

Aquí tienes la guía paso a paso para que puedas revisar por qué no se están guardando los mesociclos y cómo agregar más ejercicios a tu catálogo.

---

## 1. ¿Por qué no se guardan los Mesociclos?

### ¿Dónde se guardan?

Los mesociclos se guardan en la base de datos MySQL, específicamente en la tabla **`mesocycles`**. Esta tabla está vinculada a un `program_id` (el Macrociclo).

### Posibles Causas del Error

El código en React Native (`PlanningScreen.tsx`) tiene un bloque que captura el error, pero actualmente solo muestra un mensaje genérico: _"No se pudo crear el mesociclo"_.

Lo más probable es que el servidor (Laravel) esté rechazando la petición (Error 422 - Validación) por una de estas razones:

1. **Campos vacíos:** Si borraste el número de la "Semana Inicio" o "Semana Fin", la app envía un valor `NaN` (Not a Number) y Laravel lo rechaza.
2. **Lógica de fechas:** Laravel tiene una regla `gte:start_week` que significa que la "Semana Fin" **debe ser mayor o igual** a la "Semana Inicio". Si pones semana inicio 4 y fin 2, fallará.

### ✅ Cómo corregirlo tú mismo (Paso a Paso)

Para saber **exactamente** qué está fallando, necesitas que la aplicación te muestre el error real que envía Laravel.

Ve al archivo `mobile/src/screanning/PlanningScreen.tsx` (aproximadamente en la línea 63), y busca la mutación `createMesocens/PlycleMutation`. Cambia la línea del `onError` por esto:

```tsx
onError: (err: any) => {
  // Intentamos leer el mensaje exacto que manda Laravel
  const errorMsg =
    err.response?.data?.message ||
    err.response?.data?.errors ||
    "Error desconocido";
  console.log("Error detallado del Backend:", err.response?.data);
  Alert.alert("Error del Backend", JSON.stringify(errorMsg));
};
```

_Haz lo mismo para `createProgramMutation` y `createMicrocycleMutation`._

Una vez que hagas esto, intenta crear el mesociclo de nuevo. La pantalla te mostrará una alerta detallada (ej. `"The end_week must be greater than or equal to start_week"`). ¡Ahí sabrás exactamente qué corregir!

---

## 2. ¿Dónde está la lista de Ejercicios?

El catálogo inicial de ejercicios está configurado en tu **Backend** a través de un _Seeder_ de Laravel.

**Archivo:** `backend/database/seeders/ExerciseSeeder.php`

### ✅ Cómo agregar más ejercicios

Abre ese archivo. Verás un arreglo (Array) llamado `$exercises`. Solo tienes que agregar una nueva línea siguiendo el mismo formato. Por ejemplo:

```php
        $exercises = [
            ['name' => 'Sentadilla Libre', 'muscle_group' => 'Piernas', 'description' => 'Flexión de rodillas y cadera con peso libre.'],
            ['name' => 'Press de Banca', 'muscle_group' => 'Pecho', 'description' => 'Empuje horizontal en banco plano.'],
            // ... los que ya existen ...

            // 👇 AGREGA LOS NUEVOS AQUÍ 👇
            ['name' => 'Curl de Bíceps con Mancuernas', 'muscle_group' => 'Brazos', 'description' => 'Flexión de codo con mancuernas.'],
            ['name' => 'Prensa de Piernas', 'muscle_group' => 'Piernas', 'description' => 'Empuje de piernas en máquina 45 grados.'],
            ['name' => 'Hip Thrust', 'muscle_group' => 'Glúteos', 'description' => 'Extensión de cadera con barra.'],
        ];
```

**Para guardar estos nuevos ejercicios en la base de datos:**
Abre tu terminal en la carpeta `backend` y corre este comando:

```bash
php artisan db:seed --class=ExerciseSeeder
```

_(Nota: ten cuidado, ya que si corres el comando varias veces sin modificar el seeder para evitar duplicados, podría crear los ejercicios de nuevo. Si prefieres evitar duplicados en el futuro, puedes usar `Exercise::updateOrCreate(...)` en el seeder)._

---

### Resumen

1. Cambia el `onError` en tu `PlanningScreen.tsx` para ver los errores reales que Laravel te está escupiendo.
2. Agrega tus ejercicios en `ExerciseSeeder.php` y ejecuta el comando de _seed_ en tu terminal.

¡Inténtalo y me avisas qué error específico te muestra la alerta!
