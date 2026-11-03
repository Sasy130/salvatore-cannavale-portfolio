"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Flame } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fuocoPaths } from "./restaurant";
import { Photo } from "./ui";

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(element);
    media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 900px)", pointer: "(pointer: fine)" }, (context) => {
      if (!context.conditions?.motion) return;
      let started = false;
      const entrance = () => {
        if (started) return;
        started = true;
        context.add(() => {
          gsap.from(".fuoco-first-bite-title-line>span", { yPercent: 105, rotate: 2, duration: 1.05, stagger: 0.11, ease: "power3.out" });
          gsap.fromTo(".fuoco-first-bite-photo", { clipPath: "ellipse(37% 39% at 50% 50%)", scale: 1.08, rotate: -7 }, { clipPath: "ellipse(49% 48% at 50% 50%)", scale: 1, rotate: -3, duration: 1.5, ease: "power3.out" });
        });
      };
      const intro = document.querySelector<HTMLElement>(".fuoco-intro");
      if (!intro || intro.hidden) entrance();
      window.addEventListener("fuoco:ignition-complete", entrance);
      const fallback = window.setTimeout(entrance, 2850);

      const art = element.querySelector<HTMLElement>(".fuoco-first-bite-art");
      let move: ((event: PointerEvent) => void) | undefined;
      let reset: (() => void) | undefined;
      if (art && context.conditions.desktop) {
        gsap.to(art, { yPercent: 9, ease: "none", scrollTrigger: { trigger: element, start: "top top", end: "bottom top", scrub: 1 } });
        if (context.conditions.pointer) {
          const xTo = gsap.quickTo(art, "x", { duration: 0.8, ease: "power2.out" });
          const yTo = gsap.quickTo(art, "y", { duration: 0.8, ease: "power2.out" });
          move = (event) => { const bounds = element.getBoundingClientRect(); xTo(((event.clientX - bounds.left) / bounds.width - 0.5) * 10); yTo(((event.clientY - bounds.top) / bounds.height - 0.5) * 8); };
          reset = () => { xTo(0); yTo(0); };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", reset);
        }
      }
      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener("fuoco:ignition-complete", entrance);
        if (move) element.removeEventListener("pointermove", move);
        if (reset) element.removeEventListener("pointerleave", reset);
      };
    });
    return () => media.revert();
  }, []);

  return <section ref={scope} id="home" className="fuoco-first-bite" aria-labelledby="hero-title">
    <div className="fuoco-first-bite-heading">
      <p className="fuoco-first-bite-eyebrow"><span />L’ARTE DELLA PIZZA. IL PIACERE DI SCOPRIRLA.</p>
      <h1 id="hero-title" aria-label="IL FUOCO HA UN SAPORE."><span className="fuoco-first-bite-title-line"><span>IL FUOCO</span></span><span className="fuoco-first-bite-title-line"><span>HA UN</span></span><span className="fuoco-first-bite-title-line fuoco-first-bite-title-last"><span><em>SAPORE.</em></span></span></h1>
    </div>
    <div className="fuoco-first-bite-art">
      <span className="fuoco-first-bite-orbit" aria-hidden="true" />
      <span className="fuoco-first-bite-orbit-label" aria-hidden="true">FARINA · ACQUA · PASSIONE</span>
      <div className="fuoco-first-bite-photo"><Photo file="hero.webp" alt="Pizza napoletana con pomodoro, mozzarella e basilico, fotografia di repertorio" sizes="(max-width: 760px) 105vw, 62vw" preload /></div>
      <span className="fuoco-first-bite-cross fuoco-first-bite-cross-top" aria-hidden="true">+</span>
      <span className="fuoco-first-bite-cross fuoco-first-bite-cross-bottom" aria-hidden="true">+</span>
      <span className="fuoco-first-bite-photo-caption">01 / IL PRIMO MORSO</span>
    </div>
    <div className="fuoco-first-bite-copy"><p>Impasto, passione e tradizione.<br />Una storia da scoprire, un morso alla volta.</p><div className="fuoco-first-bite-actions"><Link className="fuoco-button fuoco-button-red" href={fuocoPaths.menu}>ENTRA NEL LIVING MENU<ArrowUpRight size={18} aria-hidden="true" /></Link><Link className="fuoco-first-bite-quick" href={`${fuocoPaths.menu}?view=quick`}>MENU RAPIDO<ArrowUpRight size={16} aria-hidden="true" /></Link></div></div>
    <div className="fuoco-first-bite-bottom"><a href="#storia">IL BUONO COMINCIA DA UN GESTO<ArrowDown size={17} aria-hidden="true" /></a><span><Flame size={17} strokeWidth={1} aria-hidden="true" />THE LIVING MENU · ITALIAN SOUL</span></div>
  </section>;
}
