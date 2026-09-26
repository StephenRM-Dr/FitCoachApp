/**
 * Textos legales de la app (borrador técnico — NO es asesoría legal).
 * Revisar con un abogado antes de publicar en tiendas de aplicaciones.
 *
 * Reflejan lo que el código realmente hace hoy (ver COMPLIANCE_REPORT.md).
 * Si cambian los datos recolectados o los terceros, actualiza este archivo
 * y sube LEGAL_VERSION (aquí) y `legal_version` (backend/config/fitcoach.php).
 */
import { BUSINESS } from "../config/business";

export type LegalDocId = "privacy" | "terms";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  id: LegalDocId;
  title: string;
  sections: LegalSection[];
}

const controller = `${BUSINESS.legalName} (${BUSINESS.taxId}), con domicilio en ${BUSINESS.address}, ${BUSINESS.country}.`;

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Política de Privacidad",
  sections: [
    {
      heading: "1. Responsable del tratamiento",
      body: [
        controller,
        `Contacto para asuntos de privacidad: ${BUSINESS.privacyEmail}.`,
      ],
    },
    {
      heading: "2. Datos que recopilamos",
      body: [
        "Cuenta: nombre, correo electrónico, contraseña (almacenada cifrada, nunca en texto legible), rol (coach o asesorado) y género.",
        "Perfil: edad, ocupación, nivel de actividad y objetivo principal (opcionales).",
        "Datos de salud (sensibles, opcionales): patologías, lesiones, cirugías, medicamentos, hábito de fumar y antecedentes familiares.",
        "Mediciones corporales: peso, estatura, cintura, cadera y frecuencia cardíaca en reposo.",
        "Nutrición y hábitos: agua, horas de sueño, calorías, metas de macronutrientes y si completaste tu sesión.",
        "Entrenamiento: programas, sesiones y, por cada serie que registras, peso, repeticiones, RPE, RIR y notas.",
        "Técnicos: token de sesión guardado en el almacenamiento seguro de tu dispositivo, preferencias de la app y registros técnicos del servidor (dirección IP y fecha de la solicitud) con fines de seguridad.",
        "No usamos analíticas de comportamiento, publicidad ni SDK de seguimiento de terceros.",
      ],
    },
    {
      heading: "3. Para qué usamos tus datos y con qué base",
      body: [
        "Prestar el servicio (crear tu cuenta, mostrar y registrar tus entrenamientos, permitir que tu coach planifique): ejecución del contrato que aceptas al registrarte.",
        "Tratar tus datos de salud: tu consentimiento explícito, que das por separado al registrarte y puedes retirar eliminando tu cuenta. Los usamos solo para que tu coach adapte el entrenamiento.",
        "Seguridad y prevención de abuso (por ejemplo, límite de intentos de acceso): interés legítimo en proteger el servicio.",
        "No vendemos tus datos ni los usamos para publicidad.",
      ],
    },
    {
      heading: "4. Quién puede ver tus datos",
      body: [
        "Tu coach asignado puede ver y completar tu perfil, mediciones, anamnesis (incluidos los datos de salud), hábitos y entrenamientos registrados. Solo tienes un coach a la vez; para cambiar de coach, escríbenos.",
        "Ningún otro usuario puede ver tus datos.",
      ],
    },
    {
      heading: "5. Terceros y transferencias internacionales",
      body: [
        "Base de datos: Neon (PostgreSQL alojado en la nube). Almacena todos los datos descritos arriba. Región de alojamiento: [COMPLETAR].",
        "Envío de correo (código de recuperación de contraseña): proveedor de correo [COMPLETAR]. Recibe tu correo electrónico y el código.",
        "Alojamiento del servidor de la API: [COMPLETAR].",
        "Estos proveedores pueden estar en países distintos al tuyo. Trátalo como una transferencia internacional de datos.",
      ],
    },
    {
      heading: "6. Conservación",
      body: [
        "Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta desde la app (Perfil → Seguridad → Eliminar cuenta), se borran tu cuenta y tus datos asociados de forma definitiva.",
        "Copias de seguridad del proveedor de base de datos: pueden conservarse hasta [COMPLETAR: plazo] antes de purgarse.",
      ],
    },
    {
      heading: "7. Tus derechos",
      body: [
        "Puedes acceder, rectificar y actualizar tus datos desde Perfil → Información Personal.",
        "Puedes eliminar tu cuenta y tus datos desde Perfil → Seguridad → Eliminar cuenta.",
        `Para solicitar una copia de tus datos, oponerte a un tratamiento o retirar tu consentimiento, escribe a ${BUSINESS.privacyEmail}.`,
        "Si consideras que no atendimos tu solicitud, puedes acudir a la autoridad de protección de datos de tu país: [COMPLETAR según jurisdicción].",
      ],
    },
    {
      heading: "8. Seguridad",
      body: [
        "Las comunicaciones con el servidor viajan cifradas (HTTPS) en producción, las contraseñas se guardan con hash y el token de sesión se almacena en el almacén seguro del dispositivo. Ningún sistema es 100 % infalible; si detectamos una brecha que te afecte, te lo notificaremos.",
      ],
    },
    {
      heading: "9. Menores de edad",
      body: [
        "La app está dirigida a personas de 18 años o más. No recopilamos datos de menores de forma intencional; si crees que un menor se registró, escríbenos para eliminar la cuenta.",
      ],
    },
    {
      heading: "10. Cambios a esta política",
      body: [
        "Si modificamos esta política de forma relevante, te lo informaremos en la app y, cuando corresponda, volveremos a pedir tu aceptación. La versión vigente y su fecha se indican en la parte superior.",
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  id: "terms",
  title: "Términos y Condiciones",
  sections: [
    {
      heading: "1. Objeto",
      body: [
        `${BUSINESS.appName} es una plataforma que permite a un coach planificar entrenamientos para sus asesorados y a estos registrar su ejecución, hábitos y progreso. El servicio lo presta ${controller}`,
      ],
    },
    {
      heading: "2. Cuenta",
      body: [
        "Debes tener 18 años o más y proporcionar información veraz. Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad de tu cuenta.",
        "El registro como coach requiere un código de invitación. Está prohibido usar un código que no te corresponda.",
      ],
    },
    {
      heading: "3. No es consejo médico",
      body: [
        "El contenido de la app, incluidos planes de entrenamiento, metas de nutrición y mediciones, es informativo y no sustituye la valoración de un profesional de la salud.",
        "Consulta a tu médico antes de iniciar o cambiar un programa de ejercicio o alimentación, especialmente si tienes una condición médica, lesiones o tomas medicamentos. Detén el ejercicio y busca atención si sientes dolor, mareo o malestar.",
        "Los resultados varían entre personas y no se garantizan.",
      ],
    },
    {
      heading: "4. Uso aceptable",
      body: [
        "No puedes usar la app para actividades ilegales, intentar acceder a datos de otros usuarios, interferir con el servicio ni subir contenido que no tengas derecho a compartir.",
        "Los coaches pueden subir imágenes o GIF de referencia de ejercicios; al hacerlo declaran tener derecho a usarlos y permiten que se muestren a los demás usuarios de la plataforma.",
      ],
    },
    {
      heading: "5. Propiedad intelectual",
      body: [
        `La app, su diseño y su código pertenecen a ${BUSINESS.legalName}. Tus datos siguen siendo tuyos; nos autorizas a tratarlos únicamente para prestarte el servicio según la Política de Privacidad.`,
      ],
    },
    {
      heading: "6. Limitación de responsabilidad",
      body: [
        'El servicio se ofrece "tal cual". En la medida permitida por la ley, no respondemos por lesiones derivadas del ejercicio realizado por tu cuenta y riesgo ni por interrupciones del servicio. Nada en estos términos limita derechos que la ley te reconozca como consumidor.',
      ],
    },
    {
      heading: "7. Terminación",
      body: [
        "Puedes eliminar tu cuenta en cualquier momento desde Perfil → Seguridad. Podemos suspender cuentas que incumplan estos términos.",
      ],
    },
    {
      heading: "8. Ley aplicable",
      body: [
        "Estos términos se rigen por las leyes de [COMPLETAR: país/jurisdicción], sin perjuicio de las normas imperativas de protección al consumidor de tu país de residencia.",
      ],
    },
    {
      heading: "9. Cambios y contacto",
      body: [
        `Podemos actualizar estos términos; te avisaremos de los cambios relevantes. Contacto: ${BUSINESS.contactEmail}.`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_USE,
};
