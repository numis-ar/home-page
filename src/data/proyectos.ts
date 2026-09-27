// Helpers over the trilingual `proyectos` content collections: `proyectos`
// (es), `proyectosEn`, `proyectosPt`. Each page reads only the collection of
// its own language.
import { getCollection, type CollectionEntry } from "astro:content";
import { conLocale, type Idioma } from "./i18n";

export type ProyectoEntrada =
  | CollectionEntry<"proyectos">
  | CollectionEntry<"proyectosEn">
  | CollectionEntry<"proyectosPt">;

const COLECCION: Record<Idioma, "proyectos" | "proyectosEn" | "proyectosPt"> = {
  es: "proyectos",
  en: "proyectosEn",
  pt: "proyectosPt",
};

/** All projects of the language, published or not, in the order they appear on the home. */
export const proyectosOrdenados = async (idioma: Idioma): Promise<ProyectoEntrada[]> =>
  (await getCollection(COLECCION[idioma])).sort((a, b) => a.data.orden - b.data.orden);

/** Published projects of the language only, in home order. The only ones the site shows. */
export const proyectosPublicados = async (idioma: Idioma): Promise<ProyectoEntrada[]> =>
  (await proyectosOrdenados(idioma)).filter((p) => p.data.publicado);

/** URL of a project's own page in the given language. */
export const rutaProyecto = (proyecto: ProyectoEntrada, idioma: Idioma): string =>
  conLocale(idioma, `/proyectos/${proyecto.id}`);
