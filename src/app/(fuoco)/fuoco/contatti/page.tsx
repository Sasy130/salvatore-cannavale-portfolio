import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { Location } from "@/features/fuoco/location";
import { fuocoPaths, restaurant } from "@/features/fuoco/restaurant";
import { pageMetadata } from "@/features/fuoco/seo";
import { Eyebrow } from "@/features/fuoco/ui";
import "@/features/fuoco/restaurant-pages.css";

export const metadata = pageMetadata(
  "Contatti e dove siamo",
  `Trova contatti, orari e indicazioni di ${restaurant.name}. Le informazioni del locale vengono mostrate quando confermate.`,
  fuocoPaths.contacts,
);

export default function ContactsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="fuoco-contact-page">
      <header className="fuoco-contact-page-hero fuoco-section">
        <div data-reveal><Eyebrow light>CONTATTI · {restaurant.name}</Eyebrow><h1>Ci vediamo<br /><em>a tavola.</em></h1><p>Per una domanda, una curiosità.<br />O per il piacere di incontrarci.</p>{restaurant.demo && <span className="fuoco-page-demo-note">CONCEPT DEMO · DATI DEL LOCALE DA CONFERMARE</span>}</div>
        <div className="fuoco-contact-page-hero-aside" aria-hidden="true"><Flame strokeWidth={.65} /><span>IL CALORE<br />DELL’OSPITALITÀ.</span></div>
      </header>
      <Location />
      <section className="fuoco-contact-page-menu fuoco-section" aria-labelledby="contacts-menu-title" data-reveal><div><Eyebrow light>INTANTO, LASCIATI ISPIRARE</Eyebrow><h2 id="contacts-menu-title">Il prossimo incontro<br /><em>ha già un buon sapore.</em></h2></div><Link className="fuoco-button fuoco-button-red" href={fuocoPaths.menu}>ESPLORA IL MENU<ArrowUpRight size={18} aria-hidden="true" /></Link></section>
    </main>
  );
}
