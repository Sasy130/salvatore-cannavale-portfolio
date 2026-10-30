"use client";
import { useState, FormEvent } from "react";
import {
  CarFront,
  Bike,
  CalendarDays,
  MapPin,
  ArrowUpRight,
  Info,
} from "lucide-react";
export function JourneySearch() {
  const [type, setType] = useState("Auto"),
    [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    const p = new FormData(e.currentTarget),
      d = String(p.get("dal")),
      a = String(p.get("al"));
    if (Date.parse(d) <= Date.now() || Date.parse(a) <= Date.parse(d)) {
      e.preventDefault();
      setError("Scegli un ritiro futuro e una riconsegna successiva.");
    } else setError("");
  }
  return (
    <div className="search-wrapper">
      <div className="search-top">
        <div role="group" aria-label="Scegli il mezzo" className="search-tabs">
          {[
            { name: "Auto", icon: CarFront },
            { name: "Scooter", icon: Bike },
          ].map((t) => (
            <button
              key={t.name}
              aria-pressed={type === t.name}
              className={type === t.name ? "active" : ""}
              onClick={() => setType(t.name)}
            >
              <t.icon size={17} />
              {t.name}
            </button>
          ))}
        </div>
        <span>
          <MapPin size={14} /> NAPOLI CENTRALE
        </span>
      </div>
      <form action="/demos/rent-car-station/flotta/" onSubmit={submit} className="journey-search">
        <input type="hidden" name="tipo" value={type} />
        <div className="search-place">
          <span className="field-caption">IL TUO PUNTO DI PARTENZA</span>
          <strong>Napoli · Stazione Centrale</strong>
          <span>Corso Arnaldo Lucci, 173</span>
        </div>
        <div className="search-field">
          <label htmlFor="search-start">
            <CalendarDays size={13} /> DATA E ORA DI RITIRO
          </label>
          <input id="search-start" name="dal" type="datetime-local" required />
        </div>
        <div className="search-field">
          <label htmlFor="search-end">
            <CalendarDays size={13} /> DATA E ORA DI RICONSEGNA
          </label>
          <input id="search-end" name="al" type="datetime-local" required />
        </div>
        <button className="button orange">
          Trova la tua direzione <ArrowUpRight size={18} />
        </button>
        <p
          className={error ? "search-note error" : "search-note"}
          role={error ? "alert" : undefined}
        >
          <Info size={12} />
          {error ||
            "Ricerca demo. Disponibilità, condizioni e preventivo da confermare con l’attività."}
        </p>
      </form>
    </div>
  );
}
