import { Flame } from "lucide-react";
import { Eyebrow } from "@/features/fuoco/ui";
import { MenuExperience } from "@/features/fuoco/menu-experience";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import "@/features/fuoco/menu.css";

export const metadata = pageMetadata("Il menu", `Esplora le classiche, le speciali, i fritti e le bevande di ${restaurant.name}. Ingredienti e schede da scoprire.`, fuocoPaths.menu);

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const { view } = await searchParams;
  const mode = view === "quick" ? "quick" : "experience";
  return (
    <main id="main-content" className="fuoco-menu-page" tabIndex={-1}>
      <header className="fuoco-menu-intro fuoco-section">
        <div data-reveal><Eyebrow light>{restaurant.name} PRESENTA · THE LIVING MENU</Eyebrow><h1>Il menu, <em>vivo.</em></h1></div>
        <div className="fuoco-menu-intro-aside" data-reveal><Flame size={33} strokeWidth={1} aria-hidden="true" /><p>UN INCONTRO DI GESTI,<br />INGREDIENTI E CARATTERE.</p></div>
      </header>
      <MenuExperience key={mode} initialMode={mode} />
    </main>
  );
}
