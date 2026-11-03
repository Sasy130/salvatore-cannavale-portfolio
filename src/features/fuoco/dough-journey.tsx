"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Flame } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "./ui";
import { fuocoPaths } from "./restaurant";

const scenes = [
  { id: "01", name: "La materia.", label: "L’IMPASTO", copy: "Prima del sapore, una materia semplice. L’impasto è il primo capitolo di una storia fatta di gesti.", file: "dough.webp", alt: "Mani che lavorano un impasto su un piano infarinato, fotografia di repertorio" },
  { id: "02", name: "Il gesto.", label: "LA LAVORAZIONE", copy: "Le mani accompagnano la forma. È il piacere di dedicare attenzione a qualcosa che presto sarà condiviso.", file: "pizzaiolo.webp", alt: "Il gesto delle mani nell’impasto, fotografia di repertorio" },
  { id: "03", name: "Il calore.", label: "IL FORNO", copy: "Il colore cambia. L’attesa prende profumo. Il forno trasforma il gesto in un invito a tavola.", file: "oven.webp", alt: "Una pizza cuoce nel calore di un forno a legna, fotografia di repertorio" },
  { id: "04", name: "Il momento.", label: "LA PIZZA PRONTA", copy: "Il viaggio finisce dove comincia il momento più bello. Una pizza al centro, le persone intorno.", file: "hero.webp", alt: "Pizza Margherita pronta da condividere, fotografia di repertorio" },
];

export function DoughJourney() {
  const scope = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(element);
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", (context) => {
      element.dataset.enhanced = "true";
      const photos = gsap.utils.toArray<HTMLElement>(".fuoco-dough-stage-photo", element);
      const steps = gsap.utils.toArray<HTMLElement>("[data-dough-step]", element);
      let active = -1;
      const activate = (index: number) => {
        if (index === active) return;
        active = index;
        if (stage.current) stage.current.dataset.scene = String(index);
        if (count.current) count.current.textContent = scenes[index].id;
        context.add(() => {
          photos.forEach((photo, photoIndex) => {
            gsap.killTweensOf(photo);
            if (photoIndex === index) {
              gsap.set(photo, { zIndex: 2 });
              gsap.fromTo(photo, { opacity: 0, clipPath: index % 2 ? "inset(0 0 0 100%)" : "inset(12% 0 12% 0)", scale: 1.04, rotate: index % 2 ? -2 : 2 }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1, rotate: 0, duration: 0.7, ease: "power2.out", overwrite: true });
            } else {
              gsap.set(photo, { zIndex: 1 });
              gsap.to(photo, { opacity: 0, duration: 0.5, overwrite: true });
            }
          });
        });
        steps.forEach((step, stepIndex) => { step.dataset.active = stepIndex === index ? "true" : "false"; });
      };
      activate(0);
      steps.forEach((step, index) => {
        ScrollTrigger.create({ trigger: step, start: "top 60%", end: "bottom 60%", onEnter: () => activate(index), onEnterBack: () => activate(index) });
      });
      ScrollTrigger.refresh();
      return () => {
        gsap.killTweensOf(photos);
        delete element.dataset.enhanced;
        steps.forEach((step) => { delete step.dataset.active; });
        if (stage.current) stage.current.dataset.scene = "0";
        if (count.current) count.current.textContent = "01";
      };
    });
    return () => media.revert();
  }, []);

  return <section ref={scope} id="percorso" className="fuoco-dough-journey" aria-labelledby="dough-journey-title">
    <header className="fuoco-dough-heading"><p>THE DOUGH JOURNEY <span>QUATTRO GESTI. UN SOLO PIACERE.</span></p><h2 id="dough-journey-title">Dalle mani.<br /><em>Al primo morso.</em></h2><span className="fuoco-dough-heading-note">Il racconto del nostro immaginario.<br />Fotografie autentiche di repertorio.</span></header>
    <div className="fuoco-dough-layout">
      <div ref={stage} className="fuoco-dough-stage" data-scene="0" aria-hidden="true"><div className="fuoco-dough-stage-images">{scenes.map((scene, index) => <div key={scene.id} className={`fuoco-dough-stage-photo ${index === 0 ? "fuoco-dough-stage-first" : ""}`}><Photo file={scene.file} alt="" sizes="60vw" /></div>)}</div><div className="fuoco-dough-stage-caption"><span ref={count}>01</span><span>DAL PRIMO GESTO<br />ALL’ULTIMO MORSO.</span><Flame size={25} strokeWidth={1} /></div></div>
      <div className="fuoco-dough-steps">{scenes.map((scene, index) => <article key={scene.id} className="fuoco-dough-step" data-dough-step={index}><div className="fuoco-dough-step-image"><Photo file={scene.file} alt={scene.alt} sizes="(max-width: 760px) 100vw, 60vw" /></div><div className="fuoco-dough-step-copy"><p className="fuoco-dough-step-label"><span>{scene.id}</span>{scene.label}</p><h3>{scene.name}</h3><p>{scene.copy}</p>{index === 3 && <Link href={fuocoPaths.menu} className="fuoco-text-link">IL VIAGGIO CONTINUA NEL MENU<ArrowUpRight size={18} aria-hidden="true" /></Link>}</div></article>)}</div>
    </div>
  </section>;
}
