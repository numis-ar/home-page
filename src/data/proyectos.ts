// Helpers over the `proyectos` content collection (src/content.config.ts).
import { getCollection, type CollectionEntry } from "astro:content";

export type ProyectoEntrada = CollectionEntry<"proyectos">;

/** All projects, published or not, in the order they appear on the home. */
export const proyectosOrdenados = async (): Promise<ProyectoEntrada[]> =>
  (await getCollection("proyectos")).sort((a, b) => a.data.orden - b.data.orden);

/** Published projects only, in home order. The only ones the site shows. */
export const proyectosPublicados = async (): Promise<ProyectoEntrada[]> =>
  (await proyectosOrdenados()).filter((p) => p.data.publicado);

/** URL of a project's own page. */
export const rutaProyecto = (proyecto: ProyectoEntrada): string => `/proyectos/${proyecto.id}`;
