"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { journeyWaypoints } from "@/data/journey";
import styles from "./journey.module.css";

export function JourneyProgression({ children, chart }: { children: ReactNode; chart: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const points = Array.from(element.querySelectorAll<HTMLElement>("[data-waypoint]"));
    const label = element.querySelector<HTMLElement>("[data-chart-label]");
    const counter = element.querySelector<HTMLElement>("[data-chart-counter]");
    let frame = 0;
    let previous = -1;
    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * .58;
      let active = 0;
      points.forEach((point, index) => { if (point.getBoundingClientRect().top <= readingLine) active = index; });
      if (active === previous) return;
      previous = active;
      element.dataset.stage = String(active);
      points.forEach((point, index) => {
        point.dataset.reached = String(index <= active);
        point.dataset.active = String(index === active);
      });
      if (label) label.textContent = journeyWaypoints[active].label;
      if (counter) counter.textContent = `0${active + 1} / 06`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div ref={root} className={styles.progression} data-stage="0">
    <aside className={styles.instrument} aria-label="Journey route illustration">
      <div className={styles.instrumentHeader}><span>SEA → OPERATIONS → SYSTEMS</span><span data-chart-counter>01 / 06</span></div>
      <div className={styles.chart}>{chart}</div>
      <div className={styles.instrumentFooter}><span className={styles.signal} /><span data-chart-label>{journeyWaypoints[0].label}</span><span className={styles.instrumentCross}>+</span></div>
      <p className={styles.instrumentNote}>One route. A different way of thinking.</p>
    </aside>
    {children}
  </div>;
}
