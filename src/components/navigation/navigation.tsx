"use client";

import { useState } from "react";
import { navigation } from "@/data/portfolio";

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a href="#origin" className="brand" aria-label="Salvatore Cannavale — home" onClick={() => setOpen(false)}>
        <span className="brand-symbol" aria-hidden="true">s<span>/</span>c<span className="brand-dot">.</span></span>
        <span className="brand-name">SALVATORE<br />CANNAVALE</span>
      </a>
      <button className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
        {open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav id="main-navigation" className={`main-navigation ${open ? "is-open" : ""}`} aria-label="Main navigation" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } }}>
        <span className="nav-route" aria-hidden="true"><i /><span /><i /><span /><i /></span>
        {navigation.map(({ label, id }, index) => (
          <a key={id} href={`#${id}`} className={index === 0 ? "is-current" : ""} aria-current={index === 0 ? "location" : undefined} onClick={() => setOpen(false)}>
            <span className="nav-index" aria-hidden="true">0{index + 1}</span>{label}
          </a>
        ))}
      </nav>
      <span className="header-location">BASED IN ITALY <span aria-hidden="true">↗</span></span>
    </header>
  );
}
