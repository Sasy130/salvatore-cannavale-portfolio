import type { Metadata } from "next";
import { restaurant, fuocoPaths, getPhoneUrl, getSocialUrl, type RestaurantConfig } from "./restaurant";

export const fuocoIsIndexable = !restaurant.demo && restaurant.allowIndexing;

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, restaurant.siteUrl).href;
  const fullTitle = `${title} — ${restaurant.name}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: { index: fuocoIsIndexable, follow: true },
    openGraph: {
      title: fullTitle, description, url, siteName: restaurant.name,
      locale: "it_IT", type: "website",
      images: [{ url: new URL("/images/fuoco/hero.webp", restaurant.siteUrl).href, width: 1600, height: 1600, alt: `${restaurant.name} — ${restaurant.tagline}` }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [new URL("/images/fuoco/hero.webp", restaurant.siteUrl).href] },
  };
}

export function restaurantSchema(config: RestaurantConfig = restaurant) {
  if (config.demo || !config.verifiedBusiness || !config.address?.trim() || !getPhoneUrl(config.phone)) return null;
  return {
    "@context": "https://schema.org", "@type": "Restaurant",
    name: config.name, url: config.siteUrl,
    address: config.address.trim(), telephone: getPhoneUrl(config.phone)?.replace("tel:", ""),
    servesCuisine: "Pizza italiana",
    sameAs: [getSocialUrl(config.socials.instagram), getSocialUrl(config.socials.facebook)].filter(Boolean),
  };
}

export function sitemapEntries() {
  if (!fuocoIsIndexable) return [];
  return Object.values(fuocoPaths).map((path) => ({ url: new URL(path, restaurant.siteUrl).href }));
}
