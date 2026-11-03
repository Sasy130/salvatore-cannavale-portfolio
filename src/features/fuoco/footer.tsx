import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./ui";
import { restaurant, fuocoPaths } from "./restaurant";

export function Footer() {
  return <footer className="fuoco-footer">
    <div className="fuoco-footer-top"><Brand footer /><p>La pizza è una cosa semplice.<br /><em>Farla bene è un’arte.</em></p><a href="#top" className="fuoco-back-top" aria-label="Torna all’inizio della pagina"><ArrowUpRight size={25} strokeWidth={1.2} aria-hidden="true" /></a></div>
    <div className="fuoco-footer-bottom"><span>© {new Date().getFullYear()} {restaurant.name}{restaurant.demo ? " · CONCEPT DEMO" : ""}</span><nav aria-label="Navigazione nel footer"><Link href={fuocoPaths.menu}>Menu</Link><Link href={fuocoPaths.story}>La nostra storia</Link><Link href={fuocoPaths.contacts}>Contatti</Link></nav><a href="/images/fuoco/CREDITS.md">Fotografie e crediti<ArrowUpRight size={12} aria-hidden="true" /></a></div>
    {restaurant.stockPhotography && <p className="fuoco-editorial-note">Fotografie di repertorio: non ritraggono un locale {restaurant.name} reale.{restaurant.demo ? " Contenuti, ricette e prezzi sono dimostrativi." : ""}</p>}
  </footer>;
}
