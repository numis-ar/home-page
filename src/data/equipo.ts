// Helpers over the `equipo` content collection (src/content.config.ts).
import { getCollection, type CollectionEntry } from "astro:content";

export type IntegranteEntrada = CollectionEntry<"equipo">;

/** Every member, in listing order. */
export const equipoOrdenado = async (): Promise<IntegranteEntrada[]> =>
  (await getCollection("equipo")).sort((a, b) => a.data.orden - b.data.orden);
