import type { APIContext } from "astro";
import { feedBlog } from "../../../data/blog";

export async function GET(context: APIContext) {
  return feedBlog("pt", context);
}
