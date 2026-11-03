"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ArrowUpRight, Flame, ListFilter, MessageCircle, Search, Sparkles, X } from "lucide-react";
import { categories, menuItems, type MenuCategory, type MenuItem } from "./menu-data";
import { fuocoPaths, getMenuPrice, getWhatsAppUrl, restaurant } from "./restaurant";
import { Photo } from "./ui";
import Link from "next/link";
import { PizzaOrbit } from "./pizza-orbit";
import { findMenuItems, type MenuFilter } from "./menu-search";

export type MenuMode = "experience" | "quick";
const orbitPizzas = menuItems.filter((item) => item.category === "classiche" || item.category === "speciali");

function categoryLabel(category: MenuCategory) {
  return categories.find((entry) => entry.id === category)?.label ?? category;
}

export function MenuExperience({ initialMode = "experience" }: { initialMode?: MenuMode }) {
  const [mode, setMode] = useState<MenuMode>(initialMode);
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<MenuFilter>("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const detail = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const filtered = findMenuItems(menuItems, filter, query);
  const pizzaName = selected && (selected.category === "classiche" || selected.category === "speciali") ? selected.name : undefined;
  const whatsapp = getWhatsAppUrl(pizzaName);

  useEffect(() => {
    if (!selected || !detail.current) return;
    const element = detail.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!element.open) element.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (element.open) element.close();
    };
  }, [selected]);

  const openDetail = (item: MenuItem, trigger: HTMLButtonElement) => {
    opener.current = trigger;
    setSelected(item);
  };

  useEffect(() => {
    // Resolve pre-existing fragment links after hydration; the quick list is
    // server-rendered and remains the no-JavaScript fallback.
    let scrollFrame = 0;
    const revealFragment = () => {
      const id = window.location.hash.slice(1);
      if (!menuItems.some((item) => item.id === id)) return;
      setMode("quick");
      scrollFrame = window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    const frame = window.requestAnimationFrame(revealFragment);
    window.addEventListener("hashchange", revealFragment);
    return () => { window.cancelAnimationFrame(frame); window.cancelAnimationFrame(scrollFrame); window.removeEventListener("hashchange", revealFragment); };
  }, []);

  const closeDetail = () => detail.current?.close();

  const afterClose = () => {
    setSelected(null);
    opener.current?.focus({ preventScroll: true });
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDetail();
  };

  return (
    <section className="fuoco-menu-selection" aria-label="Esplora il menu">
      <div className="fuoco-menu-modebar">
        <div className="fuoco-menu-modes" role="group" aria-label="Modalità del menu">
          <button type="button" aria-pressed={mode === "experience"} aria-controls="fuoco-experience-menu" data-mode="experience" onClick={() => setMode("experience")}><Sparkles size={16} strokeWidth={1.3} aria-hidden="true" /><span>EXPERIENCE<small>Lasciati ispirare</small></span></button>
          <button type="button" aria-pressed={mode === "quick"} aria-controls="fuoco-quick-menu" data-mode="quick" onClick={() => setMode("quick")}><ListFilter size={16} strokeWidth={1.3} aria-hidden="true" /><span>QUICK MENU<small>Il gusto, senza attesa</small></span></button>
        </div>
        <p className="fuoco-menu-mode-note">{restaurant.demo ? "UN CONCEPT. TUTTO DA ASSAGGIARE." : "LA TUA PROSSIMA SCELTA."}</p>
      </div>
      <noscript><style>{`@layer base{#fuoco-quick-menu[hidden]{display:block!important}}.fuoco-menu-modebar,#fuoco-experience-menu,.fuoco-quick-controls,.fuoco-quick-details{display:none!important}`}</style><p className="fuoco-menu-noscript">Menu rapido: prezzi e ricette demo, ingredienti e allergeni provvisori consultabili anche senza JavaScript.</p></noscript>
      <div id="fuoco-experience-menu" className="fuoco-experience-menu" hidden={mode !== "experience"}>
        <PizzaOrbit items={orbitPizzas} onDetails={openDetail} />
      </div>
      <div id="fuoco-quick-menu" className="fuoco-quick-menu" hidden={mode !== "quick"}>
        <div className="fuoco-quick-heading"><span>01 — SCEGLI CON SEMPLICITÀ</span><h2>Tutto il gusto.<br /><em>In un colpo d’occhio.</em></h2></div>
        <div className="fuoco-menu-toolbar fuoco-quick-controls">
          <label className="fuoco-menu-search" htmlFor="fuoco-menu-search"><Search size={19} strokeWidth={1.3} aria-hidden="true" /><span className="fuoco-visually-hidden">Cerca per nome o ingrediente</span><input ref={search} id="fuoco-menu-search" type="search" placeholder="Cerca una pizza, un ingrediente…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" /></label>
          <div className="fuoco-menu-filters" role="group" aria-label="Filtra per categoria">
            {[{ id: "all" as const, label: "Tutto" }, ...categories].map((category) => (
              <button key={category.id} type="button" className="fuoco-menu-filter" data-category={category.id} aria-pressed={filter === category.id} aria-controls="fuoco-menu-grid" onClick={() => setFilter(category.id)}>{category.label}</button>
            ))}
          </div>
        </div>
        <div className="fuoco-menu-toolbar-bottom"><p role="status" aria-live="polite" aria-atomic="true">{filtered.length} proposte · {filter === "all" ? "Tutto il menu" : categoryLabel(filter)}{query.trim() ? ` · “${query.trim()}”` : ""}</p>{restaurant.demo && <span>RICETTE E PREZZI DEMO</span>}</div>
        <div className="fuoco-quick-list" id="fuoco-menu-grid">
          {filtered.map((item) => {
            const price = getMenuPrice(item.price);
            const number = String(menuItems.indexOf(item) + 1).padStart(2, "0");
            return <article id={item.id} className="fuoco-quick-item" key={item.id}>
              <div className="fuoco-quick-thumbnail">{item.image ? <Photo file={item.image} alt={item.alt ?? item.name} sizes="(max-width: 760px) 76px, 120px" /> : <span aria-hidden="true">{number}</span>}</div>
              <div className="fuoco-quick-copy"><p className="fuoco-quick-category">{categoryLabel(item.category)}</p><h3>{item.name}</h3><p id={`fuoco-quick-ingredients-${item.id}`}>{item.ingredients.join(" · ")}</p><noscript><p className="fuoco-quick-allergens">Allergeni da verificare: {item.allergens.length ? item.allergens.join(" · ") : "Elenco da confermare"}. Possibili contaminazioni non valutate.</p></noscript></div>
              <p className="fuoco-quick-price" id={`fuoco-quick-price-${item.id}`}>{price.value}<small>{price.caption}</small></p>
              <button type="button" className="fuoco-quick-details" data-menu-id={item.id} aria-haspopup="dialog" aria-label={`Scopri ${item.name}`} aria-describedby={`fuoco-quick-price-${item.id} fuoco-quick-ingredients-${item.id}`} onClick={(event) => openDetail(item, event.currentTarget)}><span>DETTAGLI</span><ArrowUpRight size={20} strokeWidth={1.2} aria-hidden="true" /></button>
            </article>;
          })}
        </div>
        {filtered.length === 0 && <div className="fuoco-menu-empty"><Flame size={30} strokeWidth={1} aria-hidden="true" /><h3>Il tuo gusto è da scoprire.</h3><p>Nessuna proposta corrisponde alla ricerca. Prova un altro ingrediente o esplora tutto il menu.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); search.current?.focus(); }}>MOSTRA TUTTO IL MENU<ArrowRight size={17} aria-hidden="true" /></button></div>}
      </div>

      <aside className="fuoco-menu-note" aria-labelledby="fuoco-menu-note-title"><Flame size={26} strokeWidth={1} aria-hidden="true" /><div><h2 id="fuoco-menu-note-title">Il gusto comincia da una scelta consapevole.</h2><p>{restaurant.demo ? "Questo è un menu dimostrativo: ricette, porzioni e prezzi sono illustrativi e non costituiscono un’offerta commerciale. " : ""}Le informazioni sugli allergeni sono provvisorie e da verificare con il personale prima del consumo. Possibili contaminazioni non ancora valutate.</p><Link href={fuocoPaths.contacts}>INFORMAZIONI E CONTATTI<ArrowRight size={17} aria-hidden="true" /></Link></div></aside>

      <dialog ref={detail} className="fuoco-detail fuoco-ingredient-dive" aria-labelledby="fuoco-detail-title" aria-describedby="fuoco-detail-description" onClose={afterClose} onClick={closeFromBackdrop}>
        {selected && <>
          <div className="fuoco-detail-toolbar"><button type="button" className="fuoco-detail-close" aria-label="Chiudi scheda" onClick={closeDetail}><X size={22} strokeWidth={1.3} aria-hidden="true" /></button></div>
          <div className="fuoco-detail-panel">
            <div className={`fuoco-detail-visual ${selected.image ? "" : "fuoco-detail-visual-type"}`}>
              {selected.image ? <Photo file={selected.image} alt={selected.alt ?? selected.name} sizes="(max-width: 760px) 100vw, 50vw" /> : <div className="fuoco-menu-typography" aria-hidden="true"><span>{categoryLabel(selected.category)}</span><span className="fuoco-menu-type-name">{selected.name}</span><Flame size={55} strokeWidth={.8} /></div>}
              <span className="fuoco-detail-image-note">{selected.image ? "FOTOGRAFIA DI REPERTORIO · PRESENTAZIONE ILLUSTRATIVA" : "UNA PROPOSTA DA IMMAGINARE, UN MORSO ALLA VOLTA."}</span>
            </div>
            <div className="fuoco-detail-content">
              <p className="fuoco-detail-category"><span>INGREDIENT DIVE</span> · {categoryLabel(selected.category)}</p>
              <h2 id="fuoco-detail-title">{selected.name}</h2>
              <p id="fuoco-detail-description" className="fuoco-detail-description">{selected.description}</p>
              <div className="fuoco-detail-price"><span>{getMenuPrice(selected.price).value}</span><small>{getMenuPrice(selected.price).caption}</small></div>
              <section className="fuoco-detail-ingredients" aria-labelledby="fuoco-detail-ingredients-title"><h3 id="fuoco-detail-ingredients-title">INGREDIENTI {restaurant.demo ? "DEMO" : ""}</h3><ul>{selected.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></section>
              <section className="fuoco-detail-allergens" aria-labelledby="fuoco-detail-allergens-title"><h3 id="fuoco-detail-allergens-title">ALLERGENI · DA VERIFICARE</h3>{selected.allergens.length > 0 ? <p>{selected.allergens.join(" · ")}</p> : <p>Elenco non ancora verificato.</p>}<p>Indicazioni provvisorie, non esaustive. Verifica la ricetta effettiva e le possibili contaminazioni con il personale prima del consumo.</p></section>
              {whatsapp ? <a className="fuoco-button fuoco-button-red fuoco-detail-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} strokeWidth={1.4} aria-hidden="true" />SCRIVICI SU WHATSAPP<ArrowUpRight size={18} aria-hidden="true" /></a> : <p className="fuoco-detail-contact-pending"><MessageCircle size={18} strokeWidth={1.3} aria-hidden="true" />Il contatto WhatsApp non è ancora disponibile.</p>}
              <p className="fuoco-detail-request-note">Una richiesta di informazioni non costituisce un ordine o una prenotazione confermati.</p>
            </div>
          </div>
        </>}
      </dialog>
    </section>
  );
}
