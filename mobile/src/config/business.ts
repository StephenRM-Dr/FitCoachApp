/**
 * Datos del responsable del servicio — fuente única para las pantallas
 * legales, Ayuda y Soporte y el pie de la app.
 *
 * FitCoach Pro es un emprendimiento venezolano en fase inicial, sin
 * personería jurídica registrada: el responsable es la persona natural que
 * lo opera. Cuando se constituya una empresa (C.A., F.P., etc.), cambiar
 * `ownerName`/`idDocument` por la razón social y el RIF jurídico y subir
 * LEGAL_VERSION.
 *
 * Si cambia algún dato del titular, sube LEGAL_VERSION.
 */
export const BUSINESS = {
  appName: "FitCoach Pro",
  ownerName: "Steven Rincón Medina",
  idDocument: "RIF V-25167398-0",
  city: "San Cristóbal, estado Táchira",
  country: "Venezuela",
  contactEmail: "rincondigitalnet0@gmail.com",
  privacyEmail: "rincondigitalnet0@gmail.com",
} as const;

/** Debe coincidir con backend/config/fitcoach.php → legal_version. */
export const LEGAL_VERSION = "1.1";
export const LEGAL_LAST_UPDATED = "29 de septiembre de 2026";
