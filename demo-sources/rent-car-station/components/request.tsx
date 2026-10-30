"use client";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import {
  CarFront,
  Bike,
  Luggage,
  Compass,
  ArrowUpRight,
  ArrowLeft,
  Check,
  Info,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { brand } from "@/lib/content";
const options = [
  { id: "auto", label: "Auto", icon: CarFront },
  { id: "scooter", label: "Scooter", icon: Bike },
  { id: "bagagli", label: "Bagagli", icon: Luggage },
  { id: "tour", label: "Tour", icon: Compass },
];
const choices: Record<string, { id: string; label: string }[]> = {
  auto: [
    { id: "citycar", label: "Citycar · Fiat 500 o similare" },
    { id: "altra-auto", label: "Altra categoria · da concordare" },
  ],
  scooter: [{ id: "scooter", label: "Scooter · modello da concordare" }],
  bagagli: [
    { id: "1", label: "1 bagaglio" },
    { id: "2", label: "2 bagagli" },
    { id: "3", label: "3 bagagli" },
    { id: "4+", label: "4 o più bagagli · da concordare" },
  ],
  tour: [
    { id: "napoli", label: "Napoli" },
    { id: "pompei", label: "Pompei" },
    { id: "amalfi", label: "Costiera Amalfitana" },
  ],
};
export function RequestForm() {
  const [service, setService] = useState("auto"),
    [choice, setChoice] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(location.search),
      s = p.get("servizio") || "auto";
    if (options.some((o) => o.id === s)) {
      setService(s);
      const vehicle = p.get("veicolo");
      if (vehicle && choices[s].some((v) => v.id === vehicle))
        setChoice(vehicle);
    }
    setStart(p.get("dal") || "");
    setEnd(p.get("al") || "");
  }, []);
  function changeService(id: string) {
    setService(id);
    setChoice("");
    setError("");
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !Number.isFinite(Date.parse(start)) ||
      Date.parse(start) <= Date.now()
    ) {
      setError("Scegli una data di partenza futura.");
      return;
    }
    if (
      service !== "tour" &&
      (!Number.isFinite(Date.parse(end)) ||
        Date.parse(end) <= Date.parse(start))
    ) {
      setError("La data finale deve essere successiva a quella iniziale.");
      return;
    }
    setError("");
    setDone(true);
  }
  const selected = choices[service].find((c) => c.id === choice);
  return (
    <div className="request-layout">
      <aside className="request-sidebar">
        <span className="eyebrow orange-text">COME FUNZIONA IL CONCEPT</span>
        <h2>
          Prima il viaggio.
          <br />
          <span className="serif">Poi i dettagli.</span>
        </h2>
        <p>
          Ti chiediamo solo ciò che serve per immaginare la partenza. Nessun
          nome, email o pagamento.
        </p>
        <ol>
          <li className={!done ? "current" : ""}>
            <span>01</span>
            <div>
              <strong>La tua idea di viaggio</strong>
              <p>Servizio, preferenze e date.</p>
            </div>
          </li>
          <li className={done ? "current" : ""}>
            <span>02</span>
            <div>
              <strong>Il riepilogo dimostrativo</strong>
              <p>Controlla e modifica la tua selezione.</p>
            </div>
          </li>
        </ol>
        <div className="request-info">
          <Info size={20} />
          <p>
            <strong>È una simulazione.</strong> Le selezioni restano solo in
            memoria nel browser. Non vengono inviate o salvate. Non è una
            conferma di disponibilità o prenotazione.
          </p>
        </div>
      </aside>
      <div className="request-card">
        {done ? (
          <div className="request-result" role="status">
            <CheckCircle2 size={38} />
            <span className="eyebrow orange-text">
              RIEPILOGO DEMO / NESSUN INVIO
            </span>
            <h3>
              La tua prossima
              <br />
              <span className="serif">partenza.</span>
            </h3>
            <dl>
              <div>
                <dt>Servizio</dt>
                <dd>{options.find((o) => o.id === service)?.label}</dd>
              </div>
              <div>
                <dt>
                  {service === "bagagli"
                    ? "Bagagli"
                    : service === "tour"
                      ? "Destinazione"
                      : "Categoria di interesse"}
                </dt>
                <dd>{selected?.label}</dd>
              </div>
              <div>
                <dt>{service === "tour" ? "Partenza desiderata" : "Inizio"}</dt>
                <dd>{new Date(start).toLocaleString("it-IT")}</dd>
              </div>
              {service !== "tour" && (
                <div>
                  <dt>Fine</dt>
                  <dd>{new Date(end).toLocaleString("it-IT")}</dd>
                </div>
              )}
            </dl>
            <p>
              Simulazione completata. Non è stata inviata alcuna richiesta. Per
              proseguire davvero, contatta l’attività e verifica tutti i
              dettagli.
            </p>
            <button className="button dark full" onClick={() => setDone(false)}>
              <ArrowLeft size={16} /> Modifica la selezione
            </button>
            <a
              className="result-contact text-link"
              href={"https://wa.me/" + brand.phone.replace("+", "")}
              target="_blank"
              rel="noreferrer"
            >
              Apri il contatto WhatsApp ufficiale <ArrowUpRight size={16} />
            </a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span className="eyebrow">01 / ORGANIZZA IL VIAGGIO</span>
            <h3>Cosa hai in mente?</h3>
            <div
              className="request-services"
              role="group"
              aria-label="Servizio desiderato"
            >
              {options.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  className={service === o.id ? "active" : ""}
                  aria-pressed={service === o.id}
                  onClick={() => changeService(o.id)}
                >
                  <o.icon size={21} />
                  {o.label}
                </button>
              ))}
            </div>
            <label htmlFor="request-choice">
              {service === "bagagli"
                ? "Quanti bagagli?"
                : service === "tour"
                  ? "Quale destinazione?"
                  : "Quale categoria ti interessa?"}
            </label>
            <select
              id="request-choice"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              required
            >
              <option value="">
                Seleziona{" "}
                {service === "tour" ? "la destinazione" : "la tua preferenza"}
              </option>
              {choices[service].map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div
              className={service === "tour" ? "form-grid single" : "form-grid"}
            >
              <div>
                <label htmlFor="request-start">
                  {service === "tour"
                    ? "Data e ora desiderate"
                    : "Data e ora di " +
                      (service === "bagagli" ? "consegna" : "ritiro")}
                </label>
                <input
                  id="request-start"
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              {service !== "tour" && (
                <div>
                  <label htmlFor="request-end">
                    Data e ora di{" "}
                    {service === "bagagli" ? "ritiro bagagli" : "riconsegna"}
                  </label>
                  <input
                    id="request-end"
                    type="datetime-local"
                    required
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="pickup-note">
              <Check size={16} />
              <p>
                {service === "tour"
                  ? "Itinerario, durata e punto di incontro da concordare."
                  : "Riferimento: sede in Corso Arnaldo Lucci, 173, Napoli."}
              </p>
            </div>
            <label className="consent">
              <input type="checkbox" required />
              Ho capito che questa è una demo e non una prenotazione reale.
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button orange full">
              Visualizza riepilogo demo <ArrowUpRight size={18} />
            </button>
            <p className="form-footnote">
              Nessun invio. Nessun pagamento. Nessuna disponibilità simulata.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
