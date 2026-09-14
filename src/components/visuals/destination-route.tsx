"use client";

import { useEffect, useRef } from "react";
import styles from "@/components/sections/completion.module.css";

export function DestinationRoute() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        element.dataset.arrived = "true";
        observer.disconnect();
      }
    }, { threshold: .25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <svg ref={ref} className={styles.destinationRoute} viewBox="0 0 440 310" fill="none" aria-hidden="true">
    <path d="M20 45H115V100H200V170H330V245" stroke="#a9dce22c" />
    <path className={styles.arrivalLine} d="M20 45H115V100H200V170H330V245" pathLength="1" stroke="#a9dce2" />
    <g fill="#080f13" stroke="#a9dce299"><circle cx="20" cy="45" r="3"/><circle cx="115" cy="100" r="3"/><rect x="197" y="97" width="6" height="6"/><rect x="197" y="167" width="6" height="6"/><rect x="327" y="167" width="6" height="6"/></g>
    <g fill="#9daaad" fontFamily="monospace" fontSize="8" letterSpacing="1"><text x="20" y="28">ORIGIN</text><text x="130" y="83">OPERATIONS</text><text x="216" y="119">SOFTWARE</text><text x="216" y="193">CODEX → PROJECTS</text></g>
    <circle cx="330" cy="245" r="23" stroke="#a9dce244"/><path d="M330 212v10m0 46v10m-33-33h10m46 0h10" stroke="#a9dce255"/>
    <circle className={styles.destinationPoint} cx="330" cy="245" r="5" fill="#a9dce2"/>
    <text x="265" y="296" fill="#a9dce2" fontFamily="monospace" fontSize="8" letterSpacing="1">NEXT DESTINATION</text>
  </svg>;
}
