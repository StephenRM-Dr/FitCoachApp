/**
 * Datos del responsable del servicio — fuente única para las pantallas
 * legales, Ayuda y Soporte y el pie de la app.
 *
 * Todo lo marcado [COMPLETAR] debe ser rellenado por el titular antes de
 * publicar la app: no inventamos razón social, identificación fiscal ni
 * direcciones.
 */
export const BUSINESS = {
  appName: "FitCoach Pro",
  legalName: "[COMPLETAR: razón social o nombre completo del titular]",
  taxId: "[COMPLETAR: RIF / NIT / identificación fiscal]",
  address: "[COMPLETAR: dirección postal]",
  country: "[COMPLETAR: país del titular]",
  contactEmail: "[COMPLETAR: correo de soporte]",
  privacyEmail: "[COMPLETAR: correo para solicitudes de privacidad]",
  phone: "[COMPLETAR: teléfono de contacto, opcional]",
} as const;

/** Debe coincidir con backend/config/fitcoach.php → legal_version. */
export const LEGAL_VERSION = "1.0";
export const LEGAL_LAST_UPDATED = "26 de septiembre de 2026";
