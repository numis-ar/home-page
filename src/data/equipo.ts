// Helpers over the trilingual `equipo` content collections: `equipo` (es),
// `equipoEn`, `equipoPt`. Each page reads only the collection of its own
// language, so a member appears there only once translated.
import { getCollection, type CollectionEntry } from "astro:content";
import type { Idioma } from "./i18n";

export type IntegranteEntrada =
  | CollectionEntry<"equipo">
  | CollectionEntry<"equipoEn">
  | CollectionEntry<"equipoPt">;

const COLECCION: Record<Idioma, "equipo" | "equipoEn" | "equipoPt"> = {
  es: "equipo",
  en: "equipoEn",
  pt: "equipoPt",
};

/** Every member of the language, in listing order. */
export const equipoOrdenado = async (idioma: Idioma): Promise<IntegranteEntrada[]> =>
  (await getCollection(COLECCION[idioma])).sort((a, b) => a.data.orden - b.data.orden);
