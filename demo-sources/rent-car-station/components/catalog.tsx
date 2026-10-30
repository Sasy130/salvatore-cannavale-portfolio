"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CarFront,
  Bike,
  Info,
  X,
} from "lucide-react";
import { vehicles, Vehicle } from "@/lib/content";
import { Reveal } from "./layout";
export function VehicleCard({
  vehicle: v,
  dates,
}: {
  vehicle: Vehicle;
  dates?: { dal: string; al: string };
}) {
  const detail =
    "/flotta/" +
    v.slug +
    "/" +
    (dates ? "?" + new URLSearchParams(dates).toString() : "");
  const query = new URLSearchParams({
    servizio: v.type.toLowerCase(),
    veicolo: v.slug,
    ...dates,
  }).toString();
  return (
    <article className="vehicle-card">
      <Link href={detail} className="vehicle-photo">
        <img
          src={v.image}
          alt={v.imageAlt}
          width="1200"
          height="800"
          loading="lazy"
        />
        <span className="image-label">FOTO ILLUSTRATIVA</span>
        <span className="vehicle-number">
          {v.type === "Auto" ? "01" : "02"} /
        </span>
      </Link>
      <div className="vehicle-body">
        <div className="vehicle-type">
          <span>
            {v.type === "Auto" ? <CarFront size={15} /> : <Bike size={15} />}{" "}
            {v.type} / {v.category}
          </span>
          <span>SU RICHIESTA</span>
        </div>
        <h3>
          <Link href={detail}>{v.label}</Link>
        </h3>
        <p>Riferimento sul sito ufficiale: {v.model}.</p>
        <div className="vehicle-bottom">
          <Link href={detail} className="text-link">
            Scopri la categoria <ArrowUpRight size={17} />
          </Link>
          <Link
            className="square-link"
            href={"/richiesta/?" + query}
            aria-label={"Prova richiesta demo " + v.label}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function FleetExplorer() {
  const [type, setType] = useState("Tutti"),
    [category, setCategory] = useState("Tutte"),
    [dates, setDates] = useState<{ dal: string; al: string } | undefined>();
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (["Auto", "Scooter"].includes(p.get("tipo") || ""))
      setType(p.get("tipo")!);
    const d = p.get("dal"),
      a = p.get("al");
    if (d && a && !isNaN(Date.parse(d)) && !isNaN(Date.parse(a)))
      setDates({ dal: d, al: a });
  }, []);
  const results = vehicles.filter(
    (v) =>
      (type === "Tutti" || v.type === type) &&
      (category === "Tutte" || v.category === category),
  );
  return (
    <>
      {dates && (
        <div className="dates-banner">
          <div>
            <span className="eyebrow">IL TUO PERIODO DI INTERESSE</span>
            <strong>
              {new Date(dates.dal).toLocaleString("it-IT")} →{" "}
              {new Date(dates.al).toLocaleString("it-IT")}
            </strong>
            <p>
              Una selezione per organizzarti. Nessuna disponibilità reale
              verificata.
            </p>
          </div>
          <button
            aria-label="Cancella periodo"
            onClick={() => setDates(undefined)}
          >
            <X size={19} />
          </button>
        </div>
      )}
      <div className="catalog-toolbar">
        <div
          className="filter-group"
          role="group"
          aria-label="Filtra per mezzo"
        >
          {["Tutti", "Auto", "Scooter"].map((t) => (
            <button
              className={type === t ? "active" : ""}
              aria-pressed={type === t}
              onClick={() => setType(t)}
              key={t}
            >
              {t}
              {t === "Tutti" && <span>02</span>}
            </button>
          ))}
        </div>
        <label>
          <span>Tipologia</span>
          <select
            aria-label="Filtra per tipologia"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Tutte">Tutte le tipologie</option>
            <option value="Compatta">Compatta</option>
            <option value="Due ruote">Due ruote</option>
          </select>
        </label>
      </div>
      <div className="catalog-meta">
        <span>{results.length} categorie in evidenza</span>
        <span>SELEZIONE DEL CONCEPT · NON È UN INVENTARIO LIVE</span>
      </div>
      <div className="vehicle-grid">
        {results.map((v) => (
          <Reveal key={v.slug}>
            <VehicleCard vehicle={v} dates={dates} />
          </Reveal>
        ))}
      </div>
      {results.length === 0 && (
        <div className="empty-state">
          <h3>Una strada diversa?</h3>
          <p>Nessuna categoria corrisponde a questa combinazione di filtri.</p>
          <button
            className="button dark"
            onClick={() => {
              setType("Tutti");
              setCategory("Tutte");
            }}
          >
            Mostra tutte le categorie <ArrowRight size={17} />
          </button>
        </div>
      )}
    </>
  );
}

export function VehicleRequestLink({
  type,
  slug,
}: {
  type: string;
  slug: string;
}) {
  const [query, setQuery] = useState(
    new URLSearchParams({
      servizio: type.toLowerCase(),
      veicolo: slug,
    }).toString(),
  );
  useEffect(() => {
    const current = new URLSearchParams(location.search),
      next = new URLSearchParams({
        servizio: type.toLowerCase(),
        veicolo: slug,
      });
    for (const k of ["dal", "al"]) {
      const value = current.get(k);
      if (value && !isNaN(Date.parse(value))) next.set(k, value);
    }
    setQuery(next.toString());
  }, [type, slug]);
  return (
    <Link className="button orange full" href={"/richiesta/?" + query}>
      Prova la richiesta demo <ArrowUpRight size={18} />
    </Link>
  );
}
