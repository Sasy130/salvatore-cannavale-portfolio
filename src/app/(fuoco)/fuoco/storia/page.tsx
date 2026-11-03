import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { ingredients } from "@/features/fuoco/content";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import { Eyebrow, Photo } from "@/features/fuoco/ui";
import "@/features/fuoco/restaurant-pages.css";

export const metadata = pageMetadata(
  "La nostra storia",
  `Passione, impasto, forno e ingredienti. Il racconto editoriale di ${restaurant.name}, dedicato alla pizza artigianale italiana.`,
  fuocoPaths.story,
);

// Testi del concept: sostituire con il racconto approvato dal ristoratore.
const chapters = [
  { number: "01", label: "LA PASSIONE", title: <>Prima di una pizza.<br /><em>Un’idea di stare bene.</em></>, text: `Nell’idea di ${restaurant.name}, una pizza è l’occasione per rallentare. Per ritrovarsi intorno a un tavolo, parlare un po’ di più e lasciare che siano le cose semplici a fare la differenza.`, image: "preparation.webp", alt: "Pomodoro, farina e ingredienti su un piano di lavoro, fotografia di repertorio" },
  { number: "02", label: "L’IMPASTO", title: <>Tutto comincia<br /><em>con un gesto.</em></>, text: "Farina, acqua, mani. Il racconto dell’impasto parte da qui: dalla materia che prende forma e dall’attenzione di chi la lavora. Una gestualità essenziale, che rende visibile il piacere di creare qualcosa da condividere.", image: "dough.webp", alt: "Mani al lavoro con un impasto, fotografia di repertorio" },
  { number: "03", label: "IL FORNO", title: <>Il calore cambia<br /><em>ogni cosa.</em></>, text: "Il forno è il cuore di questo immaginario: il colore che cambia, il profumo che arriva, il calore che accompagna l’attesa. Un piccolo passaggio che riunisce gesti e ingredienti, prima che la pizza trovi la sua tavola.", image: "oven.webp", alt: "Una pizza nel calore di un forno a legna, fotografia di repertorio" },
];

export default function StoryPage() {
  return (
    <main id="main-content" tabIndex={-1} className="fuoco-story-page">
      <header className="fuoco-story-page-hero fuoco-section">
        <div data-reveal>
          <Eyebrow light>LA NOSTRA STORIA</Eyebrow>
          <h1>Una passione.<br /><em>Da condividere.</em></h1>
          <p>Il piacere delle cose semplici.<br />Il calore di ritrovarsi, a tavola.</p>
          {restaurant.demo && <span className="fuoco-page-demo-note">RACCONTO DEMO · TESTI DA PERSONALIZZARE</span>}
        </div>
        <div className="fuoco-story-page-hero-photo" data-image-reveal><Photo file="pizzaiolo.webp" alt={`Mani che lavorano l’impasto, fotografia di repertorio del concept ${restaurant.name}`} preload /></div>
      </header>

      <div className="fuoco-story-page-chapters">
        {chapters.map((chapter) => (
          <section className={`fuoco-story-page-chapter fuoco-section fuoco-story-page-chapter-${chapter.number}`} key={chapter.number} aria-labelledby={`story-chapter-${chapter.number}`}>
            <div className="fuoco-story-page-chapter-photo" data-image-reveal><Photo file={chapter.image} alt={chapter.alt} /></div>
            <div className="fuoco-story-page-chapter-copy" data-reveal>
              <p className="fuoco-story-page-chapter-index"><span>{chapter.number}</span>{chapter.label}</p>
              <h2 id={`story-chapter-${chapter.number}`}>{chapter.title}</h2>
              <p>{chapter.text}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="fuoco-story-page-ingredients fuoco-section" aria-labelledby="story-ingredients-title">
        <div className="fuoco-story-page-ingredients-heading" data-reveal><div><Eyebrow>04 · GLI INGREDIENTI</Eyebrow><h2 id="story-ingredients-title">Il buono ha<br /><em>poche parole.</em></h2></div><p>Pomodoro, mozzarella, basilico. Tre protagonisti del nostro immaginario: colori, consistenze e profumi da mettere al centro. La semplicità lascia spazio al carattere di ogni ingrediente, senza bisogno di aggiungere altro.</p></div>
        <div className="fuoco-story-page-ingredient-grid">{ingredients.map((ingredient) => <figure key={ingredient.number} data-image-reveal><Photo file={ingredient.image} alt={ingredient.alt} sizes="(max-width: 760px) 100vw, 33vw" /><figcaption><span>{ingredient.number}</span>{ingredient.name}</figcaption></figure>)}</div>
      </section>

      <section className="fuoco-story-page-tradition fuoco-section" aria-labelledby="story-tradition-title">
        <div data-reveal><Eyebrow light>05 · LA TRADIZIONE</Eyebrow><h2 id="story-tradition-title">Le cose belle<br /><em>si condividono.</em></h2><p>Per questo concept, la tradizione è un invito: partire da sapori familiari e dare spazio a nuove occasioni di incontro. Dal primo gesto a una tavola condivisa, è questo il filo dell’immaginario {restaurant.name}.</p><Link className="fuoco-button fuoco-button-red" href={fuocoPaths.menu}>SCOPRI IL MENU<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        <div className="fuoco-story-page-tradition-photo" data-image-reveal><Photo file="hero.webp" alt="Pizza Margherita da condividere, fotografia di repertorio" /></div>
        <Flame className="fuoco-story-page-tradition-mark" size={70} strokeWidth={.7} aria-hidden="true" />
      </section>
    </main>
  );
}
