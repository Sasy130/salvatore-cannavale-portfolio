"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ArrowRight, Flame } from "lucide-react";
import { restaurant } from "./restaurant";

const sessionKey = "fuoco-ignition-seen";

export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  const skipButton = useRef<HTMLButtonElement>(null);
  const sequence = useRef<gsap.core.Timeline | null>(null);

  const finish = useCallback(() => {
    const element = overlay.current;
    if (!element) return;
    const hadFocus = element.contains(document.activeElement);
    element.hidden = true;
    try { window.sessionStorage.setItem(sessionKey, "true"); } catch { /* Optional storage. */ }
    if (hadFocus) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
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
    const deadline = window.setTimeout(finish, 2100);
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: finish });
      sequence.current = timeline;
      timeline
        .fromTo(".fuoco-intro-spark", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.2 })
        .fromTo(".fuoco-intro-glow", { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 0.8, duration: 0.55, ease: "power2.out" }, 0.12)
        .fromTo(".fuoco-intro-image", { opacity: 0, clipPath: "circle(0% at 50% 50%)" }, {
          opacity: 0.55, clipPath: "circle(75% at 50% 50%)", duration: mobile ? 0.5 : 0.85, ease: "power2.out",
        }, 0.2)
        .fromTo(".fuoco-intro-brand", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, mobile ? 0.45 : 0.75)
        .to(element, { autoAlpha: 0, duration: 0.3, ease: "power1.inOut" }, mobile ? 1.05 : 1.7);
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
      <span className="fuoco-intro-spark" aria-hidden="true" />
      <div className="fuoco-intro-brand" aria-hidden="true">
        {restaurant.logoImage ? <Image src={restaurant.logoImage} width={34} height={48} alt="" /> : <Flame strokeWidth={1} />}
        <span>{restaurant.name}</span>
        <small>{restaurant.tagline}</small>
      </div>
      <button ref={skipButton} className="fuoco-intro-skip" type="button" onClick={skip}>
        Salta intro <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
