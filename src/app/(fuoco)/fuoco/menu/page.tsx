import { Flame } from "lucide-react";
import { Eyebrow } from "@/features/fuoco/ui";
import { MenuExperience } from "@/features/fuoco/menu-experience";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import "@/features/fuoco/menu.css";

export const metadata = pageMetadata("Il menu", `Esplora le classiche, le speciali, i fritti e le bevande di ${restaurant.name}. Ingredienti e schede da scoprire.`, fuocoPaths.menu);

export default function MenuPage() {
  return (
    <main id="main-content" className="fuoco-menu-page" tabIndex={-1}>
      <header className="fuoco-menu-intro fuoco-section">
        <div data-reveal><Eyebrow light>IL MENU · FATTO PER ESSERE SCOPERTO</Eyebrow><h1>Il gusto delle<br /><em>cose semplici.</em></h1></div>
        <div className="fuoco-menu-intro-aside" data-reveal><Flame size={43} strokeWidth={1} aria-hidden="true" /><p>La tua prossima pizza<br />comincia da qui.</p><span>SCEGLI. SCOPRI. LASCIATI ISPIRARE.</span></div>
      </header>
      <MenuExperience />
    </main>
  );
}
