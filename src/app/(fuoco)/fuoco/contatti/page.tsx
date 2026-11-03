import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Location } from "@/features/fuoco/location";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import { Eyebrow, Photo } from "@/features/fuoco/ui";
import "@/features/fuoco/restaurant-pages.css";
import "@/features/fuoco/creative-contact.css";

export const metadata = pageMetadata(
  "Contatti e dove siamo",
  `Trova contatti, orari e indicazioni di ${restaurant.name}. Le informazioni del locale vengono mostrate quando confermate.`,
  fuocoPaths.contacts,
);

export default function ContactsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="fuoco-contact-page">
      <header className="fuoco-table-reveal">
        <div className="fuoco-table-photo" data-image-reveal="table">{restaurant.locationImage ? <Image src={restaurant.locationImage} alt={`Il locale ${restaurant.name}`} fill sizes="(max-width:760px) 100vw, 65vw" preload /> : <Photo file="hero.webp" alt="Pizza appena sfornata su un piano di legno, fotografia di repertorio" sizes="(max-width:760px) 100vw, 65vw" preload />}<span className="fuoco-table-photo-label">{restaurant.locationImage ? restaurant.name : "UN’ATMOSFERA DA CONDIVIDERE · FOTO DI REPERTORIO"}</span></div>
        <div className="fuoco-table-copy" data-reveal><Eyebrow light>TABLE REVEAL · {restaurant.name}</Eyebrow><h1>Il posto <br />più bello?<br /><em>A tavola.</em></h1><p>Un incontro comincia così.<br />Una domanda, una pizza, un po’ di tempo insieme.</p><a className="fuoco-text-link" href="#dove-siamo">TROVIAMOCI QUI<ArrowUpRight size={18} aria-hidden="true" /></a>{restaurant.demo && <span className="fuoco-page-demo-note">CONCEPT DEMO · DATI DEL LOCALE DA CONFERMARE</span>}</div>
        <span className="fuoco-table-seal" aria-hidden="true"><Flame size={27} strokeWidth={1} /><span>FACCIAMO SPAZIO<br />ALLE COSE BUONE.</span></span>
      </header>
      <Location />
      <section className="fuoco-contact-page-menu fuoco-section" aria-labelledby="contacts-menu-title" data-reveal><div><Eyebrow light>INTANTO, LASCIATI ISPIRARE</Eyebrow><h2 id="contacts-menu-title">Il prossimo incontro<br /><em>ha già un buon sapore.</em></h2></div><Link className="fuoco-button fuoco-button-red" href={fuocoPaths.menu}>ESPLORA IL MENU<ArrowUpRight size={18} aria-hidden="true" /></Link></section>
    </main>
  );
}
