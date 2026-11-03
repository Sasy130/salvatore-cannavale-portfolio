import type { MetadataRoute } from "next";
import { restaurant } from "@/features/fuoco/restaurant";
import { fuocoIsIndexable } from "@/features/fuoco/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", ...(fuocoIsIndexable ? {} : { disallow: "/fuoco" }) },
    sitemap: new URL("/fuoco/sitemap.xml", restaurant.siteUrl).href,
  };
}
