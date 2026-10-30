"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Phone,
  MapPin,
  TrainFront,
  Navigation,
  Mail,
  MessageCircle,
} from "lucide-react";
import { brand } from "@/lib/content";
import { motion, useReducedMotion } from "motion/react";
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { y: 18 }}
      whileInView={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
export function Logo() {
  return (
    <Link href="/" aria-label="Rent Car Station, homepage" className="logo">
      <span className="logo-symbol">
        <span />
        <span />
        <span />
      </span>
      <span>
        RENT CAR
        <span>
          STATION<span className="logo-period">.</span>
        </span>
      </span>
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <div className="concept-bar">
        <span>
          <i /> Concept dimostrativo non ufficiale
        </span>
        <Link href="/progetto/">
          La proposta di redesign <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="header">
        <div className="nav-inner">
          <Logo />
          <nav
            id="navigation"
            className={open ? "nav open" : "nav"}
            aria-label="Menu principale"
          >
            <Link href="/flotta/" onClick={() => setOpen(false)}>
              Auto & scooter
            </Link>
            <Link href="/servizi/bagagli/" onClick={() => setOpen(false)}>
              Deposito bagagli
            </Link>
            <Link href="/servizi/tour/" onClick={() => setOpen(false)}>
              Vivi Napoli
            </Link>
            <a href="/demos/rent-car-station/#contatti" onClick={() => setOpen(false)}>
              Dove siamo
            </a>
          </nav>
          <Link className="button small orange nav-button" href="/richiesta/">
            Organizza il viaggio <ArrowUpRight size={15} />
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="navigation"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-head">
        <Logo />
        <p>
          Prossima fermata?
          <br />
          <span>La tua libertà.</span>
        </p>
        <Link
          href="/richiesta/"
          className="circle-button"
          aria-label="Organizza il tuo viaggio"
        >
          <ArrowUpRight size={28} />
        </Link>
      </div>
      <div className="footer-grid">
        <div>
          <span className="eyebrow">UNA CITTÀ, TANTE STRADE</span>
          <Link href="/flotta/">Auto & scooter</Link>
          <Link href="/servizi/bagagli/">Deposito bagagli</Link>
          <Link href="/servizi/tour/">Tour ed esperienze</Link>
        </div>
        <div>
          <span className="eyebrow">PARTI DA QUI</span>
          <p>
            {brand.address}
            <br />
            {brand.city}
          </p>
          <a href={"tel:" + brand.phone}>{brand.phoneLabel}</a>
          <a href={"mailto:" + brand.email}>{brand.email}</a>
        </div>
        <div className="footer-concept">
          <span className="eyebrow">UN NUOVO PUNTO DI PARTENZA</span>
          <p>
            Concept indipendente non ufficiale. Non commissionato, approvato o
            affiliato a Rent Car Station. Nessuna prenotazione acquisita.
          </p>
          <Link href="/progetto/">
            Scopri il progetto <ArrowUpRight size={14} />
          </Link>
          <a href={brand.official} target="_blank" rel="noreferrer">
            Sito ufficiale dell’attività <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Rent Car Station Srl · P. IVA {brand.vat}</span>
        <span>DESIGN CONCEPT / NAPOLI / 2026</span>
      </div>
    </footer>
  );
}
export function ContactBlock() {
  return (
    <section className="contact-section section" id="contatti">
      <Reveal>
        <span className="eyebrow orange-text">IL PUNTO DI PARTENZA</span>
        <h2>
          Ci vediamo
          <br />
          in <span className="serif">stazione.</span>
        </h2>
        <p>
          Sei a Napoli Centrale. Il resto del viaggio
          <br />
          lo organizzi direttamente con il team.
        </p>
        <address>
          <MapPin size={19} />
          <span>
            {brand.address}
            <br />
            {brand.city}
          </span>
        </address>
        <div className="contact-buttons">
          <a
            className="button orange"
            href={"https://wa.me/" + brand.phone.replace("+", "")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} /> Scrivi su WhatsApp{" "}
            <ArrowUpRight size={17} />
          </a>
          <a href={"tel:" + brand.phone} className="phone-link">
            <Phone size={16} />
            {brand.phoneLabel}
          </a>
        </div>
        <a className="mail-link" href={"mailto:" + brand.email}>
          <Mail size={15} />
          {brand.email}
        </a>
      </Reveal>
      <a
        className="location-map"
        href="https://www.google.com/maps/search/?api=1&query=Rent+Car+Station+Corso+Arnaldo+Lucci+173+Napoli"
        target="_blank"
        rel="noreferrer"
      >
        <div className="map-grid" aria-hidden="true">
          <div className="railway rail-one" />
          <div className="railway rail-two" />
          <div className="railway rail-three" />
          <div className="station-marker">
            <TrainFront size={26} />
            <span>
              NAPOLI
              <br />
              CENTRALE
            </span>
          </div>
          <div className="map-route" />
          <div className="office-marker">
            <span>RCS</span>
            <strong>SI PARTE DA QUI.</strong>
          </div>
          <span className="map-street">CORSO ARNALDO LUCCI</span>
        </div>
        <div className="map-footer">
          <span>Schema illustrativo della zona</span>
          <span>
            Apri le indicazioni <Navigation size={15} />
          </span>
        </div>
      </a>
    </section>
  );
}
export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
}) {
  return (
    <section className="page-intro section">
      <span className="eyebrow orange-text">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq-list">
      {items.map((i) => (
        <details key={i.q}>
          <summary>
            {i.q}
            <span>+</span>
          </summary>
          <p>{i.a}</p>
        </details>
      ))}
    </div>
  );
}
