# General Guidelines: RinconDigital Personal Trainer App

Este documento establece las reglas de desarrollo y diseño para la plataforma de entrenamiento de RinconDigital.

# General Rules
* **Prioridad de Datos:** Los ajustes de carga deben basarse exclusivamente en el biofeedback del usuario (RPE/RIR) y marcas históricas, siguiendo el principio de Entrenamiento Emergente.
* **Limpieza de Texto:** Toda entrada de texto del usuario debe pasar por el módulo de "limpiador de texto" antes de ser procesada por la lógica del programa.
* **Integridad del Código:** No eliminar funcionalidades existentes en versiones previas; el código debe mantenerse completo y modular para facilitar futuras expansiones.
* **Estructura de Datos:** Usar una arquitectura relacional clara entre `Coach`, `Cliente`, `Rutina` y `Evaluación Inicial`.

# Design System Guidelines (RinconDigital Identity)
* **Tipografía:** Fuente principal sans-serif con base de 16px para facilitar la lectura durante el entrenamiento.
* **Formato de Fechas:** Las marcas y registros deben usar el formato "DD/MM/YYYY" para trazabilidad técnica.
* **Navegación:** El menú inferior (bottom toolbar) debe tener máximo 5 elementos: Inicio, Rutinas, Progreso, Nutrición y Perfil.

## Componentes Específicos

### Valoración Inicial (Anamnesis)
El sistema de diagnóstico es el corazón de la individualización. No se puede generar una rutina sin completar este paso.
* **Campos Obligatorios:** Perfil clínico, lesiones (especial atención a hombros/rodillas), antropometría inicial y movilidad.
* **Visual Style:** Los resultados de la valoración deben mostrarse en un dashboard de "Línea Base" para contrastar futuros avances.

### Registro de Marcas (Trackers)
* **Visualización:** Los avances en fuerza máxima (1RM estimado) deben presentarse mediante gráficos de líneas dinámicos.
* **Inputs:** El registro de series debe permitir marcar rápidamente el peso, repeticiones y el esfuerzo percibido (RPE de 1 a 10).

### Planificador de Rutinas
* **Métodos Permitidos:** La interfaz debe ofrecer opciones para seleccionar sistemas documentados: LISS, HIIT, EMOM, AMRAP y métodos de Fuerza Máxima.
* **Flexibilidad:** El entrenador debe poder modificar bloques de entrenamiento semanalmente basándose en los datos emergentes de la semana anterior.

# Seguridad y Privacidad
* **Datos de Salud:** Al ser una app de salud/fitness, toda información de anamnesis debe estar cifrada.
* **Consentimiento:** Incluir un checkbox de aceptación de política de datos y términos de responsabilidad física antes del primer test de fuerza.

<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
