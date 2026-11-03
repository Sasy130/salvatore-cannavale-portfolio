"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ArrowRight, Flame } from "lucide-react";
import { restaurant } from "./restaurant";

const sessionKey = "fuoco-ignition-living-seen";

export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  const skipButton = useRef<HTMLButtonElement>(null);
  const sequence = useRef<gsap.core.Timeline | null>(null);

  const finish = useCallback(() => {
    const element = overlay.current;
    if (!element || element.hidden) return;
    const hadFocus = element.contains(document.activeElement);
    element.hidden = true;
    try { window.sessionStorage.setItem(sessionKey, "true"); } catch { /* Optional storage. */ }
    if (hadFocus) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event("fuoco:ignition-complete"));
  }, []);

  useEffect(() => {
    const element = overlay.current;
    if (!element) return;
    try {
      if (window.sessionStorage.getItem(sessionKey)) return;
    } catch {
      // Private browsing can disable storage; the introduction still works.
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    element.hidden = false;
    skipButton.current?.focus({ preventScroll: true });
    // Register the fallback before starting GSAP so it also covers initialization.
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const deadline = window.setTimeout(finish, mobile ? 2150 : 2750);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: finish });
      sequence.current = timeline;
      timeline
        .fromTo(".fuoco-intro-spark", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.18 }, 0.1)
        .fromTo(".fuoco-intro-sweep", { xPercent: -115, autoAlpha: 0 }, { xPercent: 115, autoAlpha: 1, duration: mobile ? 0.55 : 0.75, ease: "power2.inOut" }, 0.2)
        .fromTo(".fuoco-intro-glow", { scale: 0.25, autoAlpha: 0 }, { scale: 1.3, autoAlpha: 0.7, duration: 0.7, ease: "power2.out" }, 0.25)
        .fromTo(".fuoco-intro-image", { opacity: 0, rotate: -9, scale: 0.68, clipPath: "ellipse(0% 0% at 50% 50%)" }, {
          opacity: 0.7, rotate: -3, scale: 1, clipPath: "ellipse(50% 50% at 50% 50%)", duration: mobile ? 0.65 : 0.95, ease: "power3.out",
        }, 0.38)
        .fromTo(".fuoco-intro-brand-letter", { yPercent: 105, opacity: 0, rotate: 4 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 0.55, stagger: 0.035, ease: "power3.out" }, mobile ? 0.66 : 0.86)
        .fromTo(".fuoco-intro-brand small, .fuoco-intro-brand>svg, .fuoco-intro-brand>img", { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, mobile ? 0.85 : 1.1)
        .to(".fuoco-intro-spark", { autoAlpha: 0, duration: 0.1 }, 0.6)
        .to(".fuoco-intro-image", { scale: 1.22, rotate: 0, duration: 0.65, ease: "power2.inOut" }, mobile ? 1.1 : 1.55)
        .to(element, { autoAlpha: 0, duration: 0.35, ease: "power2.inOut" }, mobile ? 1.5 : 2.05);
    }, element);

    const stopForPreference = () => {
      if (reducedMotion.matches) {
        sequence.current?.kill();
        finish();
      }
    };
    reducedMotion.addEventListener("change", stopForPreference);
    return () => {
      window.clearTimeout(deadline);
      reducedMotion.removeEventListener("change", stopForPreference);
      context.revert();
      sequence.current = null;
      element.hidden = true;
    };
  }, [finish]);

  const skip = () => {
    sequence.current?.kill();
    finish();
  };

  return (
    <div
      ref={overlay}
      className="fuoco-intro"
      role="dialog"
      aria-modal="true"
      hidden
      aria-label={`Introduzione ${restaurant.name}`}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          skipButton.current?.focus();
        } else if (event.key === "Escape") {
          skip();
        }
      }}
    >
      <div className="fuoco-intro-image" aria-hidden="true">
        <Image src="/images/fuoco/hero.webp" alt="" fill sizes="100vw" />
      </div>
      <div className="fuoco-intro-glow" aria-hidden="true" />
      <div className="fuoco-intro-sweep" aria-hidden="true" />
      <span className="fuoco-intro-spark" aria-hidden="true" />
      <span className="fuoco-intro-edition" aria-hidden="true">00 / THE IGNITION</span>
      <div className="fuoco-intro-brand" aria-hidden="true">
        {restaurant.logoImage ? <Image src={restaurant.logoImage} width={34} height={48} alt="" /> : <Flame strokeWidth={1} />}
        <span className="fuoco-intro-brand-word">{Array.from(restaurant.name).map((letter, index) => <span className="fuoco-intro-brand-letter" key={`${letter}-${index}`}>{letter}</span>)}</span>
        <small>{restaurant.tagline}</small>
      </div>
      <button ref={skipButton} className="fuoco-intro-skip" type="button" onClick={skip}>
        Salta intro <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
