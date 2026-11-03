import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/features/fuoco/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
