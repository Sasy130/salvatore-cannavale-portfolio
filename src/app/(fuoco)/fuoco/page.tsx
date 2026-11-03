import { Hero } from "@/features/fuoco/hero";
import { DoughJourney } from "@/features/fuoco/dough-journey";
import Link from "next/link";
import { Location } from "@/features/fuoco/location";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import { ArrowUpRight, Asterisk, Flame, MapPin } from "lucide-react";
import { Intro } from "@/features/fuoco/intro";
import { Eyebrow, Photo, TextLink } from "@/features/fuoco/ui";
import { fuoco, ingredients, pizzas } from "@/features/fuoco/content";

export const metadata = pageMetadata("L’arte della pizza", `Il fuoco ha un sapore. Impasto, passione e tradizione: scopri ${restaurant.name}, il menu digitale e la nostra ispirazione italiana.`, fuocoPaths.home);

export default function FuocoPage() {
  return (
    <>
      <Intro />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <div className="fuoco-manifesto" aria-label="La nostra ispirazione"><span>L’ARTE DI FARE LA PIZZA.</span><Flame aria-hidden="true" /><span>IL PIACERE DI STARE INSIEME.</span><Flame aria-hidden="true" /><span>IL CALORE DELLE COSE SEMPLICI.</span></div>

        <section id="storia" className="fuoco-ritual fuoco-section" aria-labelledby="ritual-title">
          <div className="fuoco-ritual-image" data-image-reveal><Photo file="pizzaiolo.webp" alt="Un pizzaiolo lavora l’impasto a mano, fotografia di repertorio" /><div className="fuoco-image-caption"><span>LE MANI. IL CUORE. IL FUOCO.</span><span>01 / IL RITUALE</span></div></div>
          <div className="fuoco-ritual-content" data-reveal><Eyebrow>FATTA CON PASSIONE</Eyebrow><h2 id="ritual-title">NON È SOLO<br />PIZZA.<br /><em>È un rituale.</em></h2><p>{fuoco.ritual}</p><TextLink href={fuocoPaths.story}>ENTRA NELLA NOSTRA STORIA</TextLink><div className="fuoco-handwritten">Le cose buone si sentono.</div></div>
        </section>

        <section className="fuoco-ingredients fuoco-section" aria-labelledby="ingredients-title">
          <div className="fuoco-section-heading" data-reveal><div><Eyebrow>POCHE COSE. QUELLE GIUSTE.</Eyebrow><h2 id="ingredients-title">La semplicità.<br /><em>Il nostro ingrediente segreto.</em></h2></div><p>Tre ingredienti, infinite emozioni.<br />La bellezza è tutta qui.</p></div>
          <div className="fuoco-ingredient-grid">{ingredients.map((ingredient) => <article className="fuoco-ingredient" key={ingredient.number} data-image-reveal><Photo file={ingredient.image} alt={ingredient.alt} sizes="(max-width: 760px) 90vw, 33vw" /><div className="fuoco-ingredient-shade" /><span className="fuoco-ingredient-number">{ingredient.number}</span><div className="fuoco-ingredient-label"><p>{ingredient.detail}</p><h3>{ingredient.name}</h3></div><Asterisk className="fuoco-ingredient-star" size={26} strokeWidth={1} aria-hidden="true" /></article>)}</div>
        </section>

        <section id="menu" className="fuoco-pizzas fuoco-section" aria-labelledby="menu-title">
          <div className="fuoco-section-heading" data-reveal><div><Eyebrow light>LE NOSTRE CLASSICHE</Eyebrow><h2 id="menu-title">Tre modi di dire<br /><em>buonissima.</em></h2></div><p>Le conosci da sempre.<br />Le riscopri a ogni morso.</p></div>
          <div className="fuoco-pizza-grid">{pizzas.map((pizza, index) => <article className="fuoco-pizza" key={pizza.name} data-reveal><div className="fuoco-pizza-image"><Photo file={pizza.image} alt={`${pizza.alt}, immagine di repertorio illustrativa`} sizes="(max-width: 760px) 100vw, 33vw" /><span className="fuoco-pizza-label">{pizza.label}</span><span className="fuoco-pizza-index">0{index + 1}</span></div><div className="fuoco-pizza-title"><h3>{pizza.name}</h3><ArrowUpRight size={22} strokeWidth={1} aria-hidden="true" /></div><p className="fuoco-pizza-note">{pizza.note}</p><p>{pizza.description}</p><TextLink href={`${fuocoPaths.menu}?view=quick#${pizza.name.toLowerCase()}`}>SCOPRI NEL MENU</TextLink></article>)}</div>
          <div className="fuoco-menu-info" id="menu-info"><Flame size={24} strokeWidth={1.2} aria-hidden="true" /><p>La tradizione è solo l’inizio.<br /><span>Scopri anche le speciali, i fritti e le bevande nel menu digitale. Ricette e prezzi demo; informazioni sugli allergeni da confermare.</span></p></div>
        </section>

        <DoughJourney />

        <section className="fuoco-final" aria-labelledby="final-title"><Photo file="hero.webp" alt="" sizes="100vw" /><div className="fuoco-final-shade" /><div className="fuoco-final-content" data-reveal><Flame size={38} strokeWidth={1} aria-hidden="true" /><p className="fuoco-small-label">CI SONO MOMENTI CHE SANNO DI PIZZA.</p><h2 id="final-title">LA PROSSIMA PIZZA<br /><em>ti sta aspettando.</em></h2><div className="fuoco-actions justify-center"><Link className="fuoco-button fuoco-button-red" href={fuocoPaths.menu}>GUARDA IL MENU<ArrowUpRight size={18} aria-hidden="true" /></Link><Link className="fuoco-button fuoco-button-outline" href={fuocoPaths.contacts}>DOVE SIAMO<MapPin size={16} aria-hidden="true" /></Link></div></div></section>

        <Location compact />
      </main>
    </>
  );
}
