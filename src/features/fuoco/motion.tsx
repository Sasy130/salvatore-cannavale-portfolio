"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Motion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scope.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(scope);
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      desktop: "(min-width: 768px)",
    }, (context) => {
      if (!context.conditions?.motion || !scope.current) return;
      const desktop = Boolean(context.conditions.desktop);

      gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current).forEach((element) => {
        gsap.from(element, {
          y: desktop ? 30 : 16,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-image-reveal]", scope.current).forEach((element, index) => {
        const clip = desktop && index % 3 === 1 ? "inset(0 100% 0 0)" : "inset(12% 0 12% 0)";
        gsap.fromTo(element, { clipPath: clip, opacity: 0.3 }, {
          clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.15, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      if (desktop) {
        gsap.utils.toArray<HTMLElement>("[data-parallax]", scope.current).forEach((element) => {
          gsap.fromTo(element, { yPercent: -2, scale: 1.06 }, {
            yPercent: 3, scale: 1.03, ease: "none",
            scrollTrigger: { trigger: element.parentElement, start: "top top", end: "bottom top", scrub: 1 },
          });
        });
      }

      // The native document scroll drives each step without pinning the page.
      gsap.utils.toArray<HTMLElement>("[data-story-step]", scope.current).forEach((element) => {
        gsap.fromTo(element, { opacity: 0.45, y: desktop ? 18 : 8 }, {
          opacity: 1, y: 0, ease: "none",
          scrollTrigger: { trigger: element, start: "top 92%", end: "top 62%", scrub: true },
        });
      });
    });

    return () => media.revert();
  }, [pathname]);

  return <div ref={scope} className="fuoco-experience">{children}</div>;
}
