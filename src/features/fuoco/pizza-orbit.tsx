"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { categories, type MenuItem } from "./menu-data";
import { getMenuPrice } from "./restaurant";
import { Photo } from "./ui";
import "./pizza-orbit.css";

type PizzaOrbitProps = {
  items: MenuItem[];
  onDetails: (item: MenuItem, trigger: HTMLButtonElement) => void;
};

type Selection = { index: number; previous: number; direction: number; revision: number };

const number = (value: number) => String(value).padStart(2, "0");
const wrap = (value: number, length: number) => ((value % length) + length) % length;

function PizzaVisual({ item, outgoing = false }: { item: MenuItem; outgoing?: boolean }) {
  return <div className={`fuoco-orbit-visual ${outgoing ? "fuoco-orbit-outgoing" : "fuoco-orbit-current"}`} aria-hidden={outgoing || undefined}>
    {item.image ? <Photo
      file={item.image}
      alt={outgoing ? "" : (item.alt ?? item.name)}
      className="fuoco-orbit-photo"
      sizes="(max-width: 600px) 90vw, (max-width: 1000px) 65vw, 48vw"
    /> : <div className="fuoco-orbit-composition">
      <span className="fuoco-orbit-composition-label">Una composizione di</span>
      <span className="fuoco-orbit-composition-name">{item.name}</span>
      <span className="fuoco-orbit-composition-rule" />
      <span className="fuoco-orbit-composition-note">L’essenza è negli ingredienti.</span>
    </div>}
  </div>;
}

export function PizzaOrbit({ items, onDetails }: PizzaOrbitProps) {
  const scope = useRef<HTMLElement>(null);
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const [selection, setSelection] = useState<Selection>({ index: 0, previous: 0, direction: 1, revision: 0 });
  const helpId = useId();
  const titleId = useId();
  const count = items.length;
  const index = count ? wrap(selection.index, count) : 0;
  const item = items[index];
  const previous = count ? items[wrap(selection.previous, count)] : undefined;

  const move = useCallback((direction: number) => {
    if (count < 2) return;
    setSelection((current) => ({
      index: wrap(current.index + direction, count),
      previous: wrap(current.index, count),
      direction,
      revision: current.revision + 1,
    }));
  }, [count]);

  function select(next: number) {
    if (next === index || count < 2) return;
    setSelection((current) => ({ index: next, previous: wrap(current.index, count), direction: next > wrap(current.index, count) ? 1 : -1, revision: current.revision + 1 }));
  }

  useLayoutEffect(() => {
    if (!scope.current || !item || !selection.revision) return;
    const media = gsap.matchMedia(scope);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const direction = selection.direction;
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(".fuoco-orbit-outgoing", { opacity: 1, rotation: 0, scale: 1 }, { opacity: 0, rotation: direction * (mobile ? -7 : -11), scale: 0.94, duration: 0.48 })
        .fromTo(".fuoco-orbit-current", { clipPath: "circle(12% at 54% 54%)", rotation: direction * 7, scale: 1.04 }, { clipPath: "circle(75% at 50% 50%)", rotation: 0, scale: 1, duration: mobile ? 0.65 : 0.85 }, 0.06)
        .fromTo(".fuoco-orbit-title", { y: mobile ? 18 : 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.12)
        .fromTo(".fuoco-orbit-detail-motion", { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.055, duration: 0.5 }, 0.22);
    });
    return () => media.revert();
  }, [item, selection.direction, selection.revision]);

  // A horizontal trackpad gesture changes pizza; vertical scrolling stays native.
  useEffect(() => {
    const region = scope.current;
    if (!region || count < 2) return;
    let total = 0;
    let lastEvent = 0;
    let lastChange = -1000;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.4 || Math.abs(event.deltaX) < 2) return;
      const now = performance.now();
      if (event.cancelable) event.preventDefault();
      if (now - lastChange < 650) return;
      if (now - lastEvent > 160 || Math.sign(total) !== Math.sign(event.deltaX)) total = 0;
      total += event.deltaX;
      lastEvent = now;
      if (Math.abs(total) < 48) return;
      move(total > 0 ? 1 : -1);
      total = 0;
      lastChange = now;
    };
    region.addEventListener("wheel", wheel, { passive: false });
    return () => region.removeEventListener("wheel", wheel);
  }, [count, move]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    else if (event.key === "Home") { event.preventDefault(); select(0); }
    else if (event.key === "End") { event.preventDefault(); select(count - 1); }
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" || !event.isPrimary || (event.target instanceof Element && event.target.closest("button, a, input, select, textarea"))) return;
    pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.4) move(x < 0 ? 1 : -1);
  }

  if (!item) return <p className="fuoco-orbit-empty">Le proposte saranno disponibili a breve.</p>;
  const price = getMenuPrice(item.price);
  const category = categories.find((entry) => entry.id === item.category)?.label ?? item.category;

  return <section
    ref={scope}
    className={`fuoco-orbit fuoco-orbit-tone-${index % 3}`}
    role="region"
    aria-roledescription="carosello"
    aria-label="Pizza Orbit, le pizze una alla volta"
    aria-describedby={helpId}
    tabIndex={0}
    onKeyDown={onKeyDown}
    onPointerDown={onPointerDown}
    onPointerUp={onPointerUp}
    onPointerCancel={() => { pointer.current = null; }}
    data-pizza-orbit
    data-orbit-index={index}
    data-orbit-id={item.id}
  >
    <p id={helpId} className="fuoco-orbit-sr">Usa le frecce sinistra e destra per cambiare pizza, Home ed End per la prima e l’ultima. Puoi anche scorrere con un gesto orizzontale.</p>
    <div className="fuoco-orbit-topline">
      <span>Materia. Gesto. Fuoco.</span>
      <span className="fuoco-orbit-topline-count" aria-hidden="true">{number(index + 1)} <span>/ {number(count)}</span></span>
    </div>
    <div className="fuoco-orbit-body">
      <div className="fuoco-orbit-stage">
        <span className="fuoco-orbit-stage-number" aria-hidden="true">{number(index + 1)}</span>
        <div className="fuoco-orbit-ring" aria-hidden="true" />
        <span className="fuoco-orbit-stage-note" aria-hidden="true">Il gusto ha la sua orbita.</span>
        <div className="fuoco-orbit-visuals">
          {previous && <PizzaVisual item={previous} outgoing />}
          <PizzaVisual item={item} />
        </div>
        <span className="fuoco-orbit-stage-signature" aria-hidden="true">Fatto di cose semplici.</span>
      </div>
      <div className="fuoco-orbit-copy" role="group" aria-roledescription="diapositiva" aria-label={`${item.name}, ${index + 1} di ${count}`}>
        <div className="fuoco-orbit-detail-motion fuoco-orbit-category"><span aria-hidden="true" />{category}<span className="fuoco-orbit-category-no">N° {number(index + 1)}</span></div>
        <h2 id={titleId} className="fuoco-orbit-title">{item.name}</h2>
        <p className="fuoco-orbit-description fuoco-orbit-detail-motion">{item.description}</p>
        <div className="fuoco-orbit-ingredients fuoco-orbit-detail-motion">
          <span className="fuoco-orbit-small-label">La materia prima</span>
          <ul aria-label={`Ingredienti di ${item.name}`}>{item.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
        </div>
        <div className="fuoco-orbit-actions fuoco-orbit-detail-motion">
          <p className="fuoco-orbit-price"><span>{price.caption}</span><strong>{price.value}</strong></p>
          <button type="button" className="fuoco-orbit-details" onClick={(event) => onDetails(item, event.currentTarget)} aria-label={`Scopri ingredienti e allergeni di ${item.name}`}>
            Dentro la pizza <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <div className="fuoco-orbit-bottomline">
      <div className="fuoco-orbit-progress" aria-label="Scegli una pizza">
        {items.map((entry, itemIndex) => <button
          key={entry.id}
          type="button"
          className={`fuoco-orbit-choice ${itemIndex === index ? "fuoco-orbit-choice-active" : ""}`}
          aria-label={`Mostra ${entry.name}, ${itemIndex + 1} di ${count}`}
          aria-pressed={itemIndex === index}
          onClick={() => select(itemIndex)}
        ><span>{number(itemIndex + 1)}</span><span className="fuoco-orbit-choice-line" aria-hidden="true" /></button>)}
      </div>
      <p className="fuoco-orbit-gesture" aria-hidden="true">Segui il tuo gusto <span>↔</span></p>
      <div className="fuoco-orbit-navigation">
        <button type="button" className="fuoco-orbit-prev" aria-label="Pizza precedente" onClick={() => move(-1)} disabled={count < 2}><ArrowLeft size={21} strokeWidth={1.4} aria-hidden="true" /></button>
        <button type="button" className="fuoco-orbit-next" aria-label="Pizza successiva" onClick={() => move(1)} disabled={count < 2}><ArrowRight size={21} strokeWidth={1.4} aria-hidden="true" /></button>
      </div>
    </div>
    <p className="fuoco-orbit-sr" role="status" aria-live="polite" aria-atomic="true">{item.name}, {index + 1} di {count}.</p>
  </section>;
}
