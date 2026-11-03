import type { Metadata } from "next";
import { restaurant } from "@/features/fuoco/restaurant";
import { Navigation } from "@/features/fuoco/navigation";
import { Footer } from "@/features/fuoco/footer";
import { Motion } from "@/features/fuoco/motion";
import { restaurantSchema, fuocoIsIndexable } from "@/features/fuoco/seo";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "./globals.css";
import "@/features/fuoco/restaurant-pages.css";
import "@/features/fuoco/creative-home.css";

export const metadata: Metadata = {
  metadataBase: new URL(restaurant.siteUrl),
  title: `${restaurant.name} — ${restaurant.tagline}`,
  description: "Il fuoco ha un sapore. Un’esperienza dedicata alla pizza artigianale italiana, ai suoi ingredienti e al piacere di stare a tavola. Concept editoriale.",
  openGraph: {
    title: "FUOCO — L’arte della pizza",
    description: "Impasto, passione e tradizione. Il fuoco ha un sapore.",
    locale: "it_IT",
    type: "website",
    images: [{ url: "/images/fuoco/hero.webp", width: 1600, height: 1600, alt: "FUOCO, concept dedicato alla pizza italiana" }],
  },
  icons: { icon: restaurant.logoImage ?? "/images/fuoco/icon.svg" },
  robots: { index: fuocoIsIndexable, follow: true },
};

export default function FuocoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = restaurantSchema();
  return <html lang="it"><body id="top" className="fuoco"><a className="fuoco-skip-link" href="#main-content">Vai al contenuto</a><Motion><Navigation />{children}<Footer /></Motion>{schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}</body></html>;
}
