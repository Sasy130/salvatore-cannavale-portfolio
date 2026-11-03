"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ArrowUpRight, Flame, MessageCircle, Plus, X } from "lucide-react";
import { categories, menuItems, type MenuCategory, type MenuItem } from "./menu-data";
import { fuocoPaths, getMenuPrice, getWhatsAppUrl, restaurant } from "./restaurant";
import { Photo } from "./ui";

type MenuFilter = "all" | MenuCategory;

function categoryLabel(category: MenuCategory) {
  return categories.find((entry) => entry.id === category)?.label ?? category;
}

export function MenuExperience() {
  const [filter, setFilter] = useState<MenuFilter>("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const detail = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const filtered = filter === "all" ? menuItems : menuItems.filter((item) => item.category === filter);
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

  const openDetail = (item: MenuItem, event: MouseEvent<HTMLButtonElement>) => {
    opener.current = event.currentTarget;
    setSelected(item);
  };

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
      <div className="fuoco-menu-toolbar">
        <div className="fuoco-menu-filters" role="group" aria-label="Filtra per categoria">
          {[{ id: "all" as const, label: "Tutto il menu" }, ...categories].map((category) => (
            <button key={category.id} type="button" className="fuoco-menu-filter" data-category={category.id} aria-pressed={filter === category.id} aria-controls="fuoco-menu-grid" onClick={() => setFilter(category.id)}>
              {category.label}
            </button>
          ))}
        </div>
        <div className="fuoco-menu-toolbar-bottom">
          <p role="status" aria-live="polite" aria-atomic="true">{filtered.length} proposte · {filter === "all" ? "Tutto il menu" : categoryLabel(filter)}</p>
          {restaurant.demo && <span>RICETTE E PREZZI DEMO</span>}
        </div>
      </div>

      <noscript><p className="fuoco-menu-noscript">Il menu è consultabile qui sotto. Attiva JavaScript per usare i filtri e aprire le schede con gli ingredienti.</p></noscript>

      <div className="fuoco-menu-grid" id="fuoco-menu-grid" key={filter}>
        {filtered.map((item) => {
          const price = getMenuPrice(item.price);
          const number = String(menuItems.indexOf(item) + 1).padStart(2, "0");
          return (
            <article id={item.id} className={`fuoco-menu-card ${item.image ? "fuoco-menu-card-photo" : "fuoco-menu-card-type"}`} key={item.id}>
              <div className="fuoco-menu-card-visual">
                {item.image ? <Photo file={item.image} alt={item.alt ?? item.name} sizes="(max-width: 640px) 100vw, (max-width: 1050px) 50vw, 33vw" /> : <div className="fuoco-menu-typography" aria-hidden="true"><span>{categoryLabel(item.category)}</span><span className="fuoco-menu-type-name">{item.name}</span><Flame size={30} strokeWidth={1} /></div>}
                <span className="fuoco-menu-card-number" aria-hidden="true">{number}</span>
                <span className="fuoco-menu-card-expand" aria-hidden="true"><Plus size={20} strokeWidth={1.3} /></span>
              </div>
              <div className="fuoco-menu-card-body">
                <div className="fuoco-menu-card-topline"><span>{categoryLabel(item.category)}</span><span className="fuoco-menu-card-price" id={`fuoco-menu-price-${item.id}`}>{price.value}<small>{price.caption}</small></span></div>
                <h2>{item.name}</h2>
                <p id={`fuoco-menu-description-${item.id}`}>{item.description}</p>
                <button type="button" className="fuoco-menu-card-button fuoco-menu-card-link" data-menu-id={item.id} aria-haspopup="dialog" aria-label={`Scopri ${item.name}`} aria-describedby={`fuoco-menu-price-${item.id} fuoco-menu-description-${item.id}`} onClick={(event) => openDetail(item, event)}>
                  SCOPRI GLI INGREDIENTI<ArrowUpRight size={17} strokeWidth={1.3} aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="fuoco-menu-note" aria-labelledby="fuoco-menu-note-title"><Flame size={26} strokeWidth={1} aria-hidden="true" /><div><h2 id="fuoco-menu-note-title">Il gusto comincia da una scelta consapevole.</h2><p>{restaurant.demo ? "Questo è un menu dimostrativo: ricette, porzioni e prezzi sono illustrativi e non costituiscono un’offerta commerciale. " : ""}Le informazioni sugli allergeni sono provvisorie e da verificare con il personale prima del consumo. Possibili contaminazioni non ancora valutate.</p><a href={fuocoPaths.contacts}>INFORMAZIONI E CONTATTI<ArrowRight size={17} aria-hidden="true" /></a></div></aside>

      <dialog ref={detail} className="fuoco-detail" aria-labelledby="fuoco-detail-title" aria-describedby="fuoco-detail-description" onClose={afterClose} onClick={closeFromBackdrop}>
        {selected && <>
          <div className="fuoco-detail-toolbar"><button type="button" className="fuoco-detail-close" aria-label="Chiudi scheda" onClick={closeDetail}><X size={22} strokeWidth={1.3} aria-hidden="true" /></button></div>
          <div className="fuoco-detail-panel">
            <div className={`fuoco-detail-visual ${selected.image ? "" : "fuoco-detail-visual-type"}`}>
              {selected.image ? <Photo file={selected.image} alt={selected.alt ?? selected.name} sizes="(max-width: 760px) 100vw, 50vw" /> : <div className="fuoco-menu-typography" aria-hidden="true"><span>{categoryLabel(selected.category)}</span><span className="fuoco-menu-type-name">{selected.name}</span><Flame size={55} strokeWidth={.8} /></div>}
              <span className="fuoco-detail-image-note">{selected.image ? "FOTOGRAFIA DI REPERTORIO · PRESENTAZIONE ILLUSTRATIVA" : "UNA PROPOSTA DA IMMAGINARE, UN MORSO ALLA VOLTA."}</span>
            </div>
            <div className="fuoco-detail-content">
              <p className="fuoco-detail-category">{categoryLabel(selected.category)}</p>
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
