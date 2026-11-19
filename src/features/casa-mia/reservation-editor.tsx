"use client";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  TriangleAlert,
  CalendarRange,
  LockKeyhole,
} from "lucide-react";
import { addDays, parseMoney, propertyToday } from "./model.mjs";
import { Modal, Primary, day, money, source } from "./ui";
import type { Booking, Preview, ReservationInput } from "./types";
export type EditorDraft = {
  kind: "booking" | "block";
  start?: string;
  end?: string;
  booking?: Booking;
};
export function ReservationEditor({
  draft,
  onClose,
  onPreview,
  onSave,
  demo,
}: {
  draft: EditorDraft;
  onClose: () => void;
  onPreview: (i: ReservationInput) => Promise<Preview>;
  onSave: (i: ReservationInput) => Promise<void>;
  demo: boolean;
}) {
  const b = draft.booking;
  const [kind, setKind] = useState(draft.kind),
    [values, setValues] = useState({
      name: b?.name || "",
      checkin: b?.checkin || draft.start || propertyToday(),
      checkout:
        b?.checkout ||
        draft.end ||
        addDays(draft.start || propertyToday(), draft.kind === "block" ? 1 : 2),
      guests: b?.guests || 2,
      email: b?.email || "",
      phone: b?.phone || "",
      notes: b?.notes || "",
      source: b?.source || "phone",
      amount: b ? String(b.total / 100).replace(".", ",") : "",
    }),
    [preview, setPreview] = useState<Preview | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  const blocking = kind === "block";
  function change(name: string, value: string | number) {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      if (name === "checkin" && next.checkout <= String(value))
        next.checkout = addDays(String(value), blocking ? 1 : 2);
      return next;
    });
    setPreview(null);
    setError("");
    key.current = crypto.randomUUID();
  }
  function input(): ReservationInput {
    const amount = blocking ? null : parseMoney(values.amount);
    return {
      kind,
      bookingId: b?.id,
      revision: b?.revision,
      name: values.name,
      checkin: values.checkin,
      checkout: values.checkout,
      guests: Number(values.guests),
      email: values.email,
      phone: values.phone,
      notes: values.notes,
      source: values.source,
      ...(amount !== null ? { amount } : {}),
      idempotency: key.current,
    };
  }
  async function review(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setPreview(await onPreview(input()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      await onSave(input());
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      wide
      title={
        b
          ? blocking
            ? "Modifica il blocco"
            : "Modifica il soggiorno"
          : blocking
            ? "Blocca le date"
            : "Nuova prenotazione"
      }
      eyebrow={demo ? "SIMULAZIONE LOCALE" : b ? b.id : "CALENDARIO CONDIVISO"}
      onClose={onClose}
      busy={busy}
    >
      <div className="cm-stepper">
        <span className={!preview ? "active" : "done"}>
          <i>{preview ? "✓" : "1"}</i>Dati e periodo
        </span>
        <span className={preview ? "active" : ""}>
          <i>2</i>Controllo e conferma
        </span>
      </div>
      {!preview ? (
        <form onSubmit={review}>
          {!b && (
            <div className="cm-choice">
              <button
                type="button"
                className={!blocking ? "active" : ""}
                onClick={() => {
                  setKind("booking");
                  setError("");
                }}
              >
                <CalendarRange size={17} />
                <span>
                  Prenotazione<small>Ospiti, contatti e importo</small>
                </span>
              </button>
              <button
                type="button"
                className={blocking ? "active" : ""}
                onClick={() => {
                  setKind("block");
                  setError("");
                }}
              >
                <LockKeyhole size={17} />
                <span>
                  Blocco date<small>Chiudi un periodo alla vendita</small>
                </span>
              </button>
            </div>
          )}
          <div className="cm-form-section">
            <h3>
              {blocking
                ? "Quale periodo vuoi chiudere?"
                : "Quando arrivano gli ospiti?"}
            </h3>
            <div className="cm-fields-two">
              <label>
                {blocking ? "Blocca dal" : "Arrivo"}
                <input
                  type="date"
                  required
                  name="checkin"
                  value={values.checkin}
                  min={
                    b?.checkin && b.checkin < propertyToday()
                      ? b.checkin
                      : propertyToday()
                  }
                  onChange={(e) => change("checkin", e.target.value)}
                />
              </label>
              <label>
                {blocking ? "Riapri il" : "Partenza"}
                <input
                  type="date"
                  required
                  name="checkout"
                  min={addDays(values.checkin, 1)}
                  value={values.checkout}
                  onChange={(e) => change("checkout", e.target.value)}
                />
              </label>
            </div>
            <p className="cm-field-note">
              {blocking
                ? "Il giorno di riapertura è già disponibile: non viene bloccato. Puoi chiudere fino a 365 notti per volta."
                : "La notte della partenza è libera. Puoi registrare accordi manuali fino a 365 notti; il minimo del sito non vincola questi inserimenti."}
            </p>
          </div>
          <div className="cm-form-section">
            <h3>
              {blocking
                ? "Perché vuoi bloccarlo?"
                : "Chi soggiorna nella casa?"}
            </h3>
            <label>
              {blocking ? "Motivo del blocco" : "Nome e cognome"}
              <input
                required
                minLength={2}
                maxLength={100}
                value={values.name}
                onChange={(e) => change("name", e.target.value)}
                placeholder={
                  blocking
                    ? "Es. manutenzione, uso personale, accordo esterno"
                    : "Usa dati inventati se sei nella demo"
                }
              />
            </label>
            {!blocking && (
              <>
                <div className="cm-fields-two">
                  <label>
                    Numero ospiti
                    <select
                      value={values.guests}
                      onChange={(e) => change("guests", +e.target.value)}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "ospite" : "ospiti"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Da dove arriva?
                    <select
                      value={values.source}
                      onChange={(e) => change("source", e.target.value)}
                    >
                      <option value="phone">Telefono / messaggio</option>
                      <option value="direct">Sito diretto</option>
                      <option value="airbnb">
                        Airbnb · inserimento manuale
                      </option>
                      <option value="booking">
                        Booking.com · inserimento manuale
                      </option>
                    </select>
                  </label>
                </div>
                <div className="cm-fields-two">
                  <label>
                    Email <span>facoltativa</span>
                    <input
                      type="email"
                      maxLength={150}
                      value={values.email}
                      onChange={(e) => change("email", e.target.value)}
                    />
                  </label>
                  <label>
                    Telefono <span>facoltativo</span>
                    <input
                      type="tel"
                      maxLength={50}
                      value={values.phone}
                      onChange={(e) => change("phone", e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              Note interne <span>non visibili agli ospiti</span>
              <textarea
                rows={3}
                maxLength={1000}
                value={values.notes}
                onChange={(e) => change("notes", e.target.value)}
                placeholder="Informazioni utili per accogliere o gestire il periodo"
              />
            </label>
          </div>
          {!blocking && (
            <div className="cm-form-section">
              <h3>Il valore del soggiorno</h3>
              <label>
                Totale concordato (€) <span>facoltativo</span>
                <input
                  inputMode="decimal"
                  value={values.amount}
                  onChange={(e) => change("amount", e.target.value)}
                  placeholder="Vuoto: usa le tariffe della casa"
                />
              </label>
              <p className="cm-field-note">
                Non è un pagamento: stai registrando il valore del soggiorno.
                Gli eventuali incassi si annotano dopo, nel dettaglio.
              </p>
            </div>
          )}
          {blocking && (
            <div className="cm-info-box">
              Hai già nome e importo di una prenotazione ricevuta fuori dal
              sito? Scegli{" "}
              <button type="button" onClick={() => setKind("booking")}>
                Prenotazione
              </button>
              : avrai anche contatti, saldo e riepilogo.
            </div>
          )}
          {error && (
            <p className="cm-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="cm-modal-actions">
            <button
              type="button"
              className="cm-button cm-button-quiet"
              onClick={onClose}
              disabled={busy}
            >
              Annulla
            </button>
            <Primary type="submit" busy={busy}>
              Controlla le date <ArrowRight size={16} />
            </Primary>
          </div>
        </form>
      ) : (
        <div className="cm-review">
          <div
            className={
              "cm-review-status " + (preview.ok ? "success" : "conflict")
            }
          >
            {preview.ok ? (
              <CheckCircle2 size={25} />
            ) : (
              <TriangleAlert size={25} />
            )}
            <div>
              <h3>
                {preview.ok
                  ? "Le date sono disponibili"
                  : "C’è qualcosa da controllare"}
              </h3>
              <p>
                {preview.ok
                  ? "Puoi confermare. Il calendario verrà verificato ancora durante il salvataggio."
                  : "Nessuna modifica è stata salvata. Correggi il periodo o il totale e riprova."}
              </p>
            </div>
          </div>
          <div className="cm-review-dates">
            <div>
              <small>{blocking ? "BLOCCA DAL" : "ARRIVO"}</small>
              <strong>{day(preview.checkin, true)}</strong>
            </div>
            <span>
              <ArrowRight size={19} />
              {preview.nights} {preview.nights === 1 ? "notte" : "notti"}
            </span>
            <div>
              <small>{blocking ? "RIAPRI IL" : "PARTENZA"}</small>
              <strong>{day(preview.checkout, true)}</strong>
            </div>
          </div>
          {blocking && (
            <p className="cm-field-note">
              Ultima notte bloccata: {day(preview.lastNight)}. Il{" "}
              {day(preview.checkout)} torna disponibile.
            </p>
          )}
          {!!preview.conflicts.length && (
            <div className="cm-conflicts">
              <h4>Periodi già occupati</h4>
              {preview.conflicts.map((c) => (
                <div key={c.id}>
                  <strong>{c.name}</strong>
                  <span>
                    {day(c.checkin)} → {day(c.checkout)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!!preview.ruleBlocks.length && (
            <p className="cm-form-error">
              Alcune date sono chiuse nelle regole della casa.
            </p>
          )}
          {preview.financialConflict && (
            <p className="cm-form-error">
              Sono già registrati {money(preview.registered)}. Verifica
              l’eventuale rimborso prima di ridurre il totale.
            </p>
          )}
          <dl className="cm-review-summary">
            <div>
              <dt>{blocking ? "Motivo" : "Ospite"}</dt>
              <dd>{values.name}</dd>
            </div>
            {!blocking && (
              <>
                <div>
                  <dt>Canale</dt>
                  <dd>{source(values.source)}</dd>
                </div>
                <div>
                  <dt>Ospiti</dt>
                  <dd>{values.guests}</dd>
                </div>
                <div className="cm-review-total">
                  <dt>Totale soggiorno</dt>
                  <dd>{money(preview.total)}</dd>
                </div>
              </>
            )}
            {values.notes && (
              <div>
                <dt>Note interne</dt>
                <dd>{values.notes}</dd>
              </div>
            )}
          </dl>
          <p className="cm-help">
            {demo
              ? "Salvataggio dimostrativo solo su questo dispositivo. Usa dati fittizi."
              : "Gli inserimenti manuali non inviano email e non addebitano pagamenti."}
            {b?.status === "pending"
              ? " La richiesta rimane da confermare."
              : ""}
          </p>
          {error && (
            <p className="cm-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="cm-modal-actions">
            <button
              className="cm-button cm-button-quiet"
              onClick={() => {
                setPreview(null);
                setError("");
              }}
              disabled={busy}
            >
              <ArrowLeft size={16} />
              Modifica dati
            </button>
            <Primary onClick={save} busy={busy} disabled={!preview.ok}>
              {b
                ? "Salva modifiche"
                : blocking
                  ? "Conferma blocco"
                  : "Conferma prenotazione"}{" "}
              <CheckCircle2 size={17} />
            </Primary>
          </div>
        </div>
      )}
    </Modal>
  );
}
