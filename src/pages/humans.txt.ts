// humans.txt (humanstxt.org): who makes Numis and with what. Built from the
// `equipo` collection, so it follows the team page without manual edits.
import { equipoOrdenado } from "../data/equipo";
import { CORREO, RAZON_SOCIAL, SEDE } from "../data/sitio";

export async function GET() {
  const equipo = (await equipoOrdenado("es")).map(
    (integrante) => `  ${integrante.data.nombre}\n  Especialidad: ${integrante.data.especialidad}`,
  );
  const texto = [
    "/* EQUIPO */",
    "",
    equipo.join("\n\n"),
    "",
    "/* COOPERATIVA */",
    "",
    `  ${RAZON_SOCIAL}`,
    `  Sede: ${SEDE}`,
    `  Contacto: ${CORREO}`,
    "  Sitio: https://www.numis.ar",
    "",
    "/* SITIO */",
    "",
    "  Idiomas: español, English, português",
    "  Hecho con: Astro, software libre",
    "",
  ].join("\n");
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
