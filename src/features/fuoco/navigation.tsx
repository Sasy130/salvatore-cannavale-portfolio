"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Flame, Menu, X } from "lucide-react";
import { restaurant, fuocoPaths } from "./restaurant";

const links = [
  { href: fuocoPaths.home, label: "Home" },
  { href: fuocoPaths.menu, label: "Menu" },
  { href: fuocoPaths.story, label: "La nostra storia" },
  { href: fuocoPaths.contacts, label: "Contatti" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navigation.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav ref={navigation} className="fuoco-nav" aria-label="Navigazione principale" data-open={open}>
      <Link className="fuoco-brand" href={fuocoPaths.home} aria-label={`${restaurant.name}, home`} onClick={close}>
        {restaurant.logoImage ? <Image className="fuoco-brand-mark" src={restaurant.logoImage} alt="" width={31} height={42} /> : <Flame className="fuoco-brand-mark" aria-hidden="true" strokeWidth={1.4} />}
        <span>
          <span className="fuoco-brand-name">{restaurant.name}</span>
          <span className="fuoco-brand-tagline">{restaurant.tagline}</span>
        </span>
      </Link>
      {restaurant.demo && <span className="fuoco-demo-badge">CONCEPT DEMO</span>}

      <div className="fuoco-nav-links">
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
      </div>
      <Link className="fuoco-nav-cta" href={fuocoPaths.contacts}>
        Vieni a trovarci <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
      <button
        ref={toggle}
        className="fuoco-nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="fuoco-mobile-navigation"
        aria-label={open ? "Chiudi il menu di navigazione" : "Apri il menu di navigazione"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <div id="fuoco-mobile-navigation" className="fuoco-mobile-menu" hidden={!open}>
        {links.map((link, index) => (
          <Link key={link.href} href={link.href} onClick={close} aria-current={pathname === link.href ? "page" : undefined}>
            <span aria-hidden="true">0{index + 1}</span> {link.label}
          </Link>
        ))}
        <Link href={fuocoPaths.contacts} onClick={close} className="fuoco-mobile-cta">
          Vieni a trovarci <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
