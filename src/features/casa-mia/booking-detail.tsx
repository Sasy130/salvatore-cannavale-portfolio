"use client";
import { useRef, useState } from "react";
import {
  Mail,
  Phone,
  Pencil,
  Wallet,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  TriangleAlert,
  LockKeyhole,
} from "lucide-react";
import { moneyState, isActive, dateRange } from "./model.mjs";
import { Modal, Primary, Status, Empty, day, money, source } from "./ui";
import type { Booking, OwnerData } from "./types";
const METHODS: Record<string, string> = {
  cash: "Contanti",
  bank: "Bonifico",
  pos: "POS esterno",
  other: "Altro metodo",
};
export const EVENT_NAMES: Record<string, string> = {
  reservation_created: "Prenotazione inserita",
  reservation_updated: "Date o dati modificati",
  dates_blocked: "Periodo bloccato",
  reservation_confirmed: "Prenotazione confermata",
  reservation_cancelled: "Date liberate",
  payment_recorded: "Incasso registrato",
  refund_recorded: "Rimborso annotato",
};
export function BookingDetail({
  booking: b,
  data,
  onClose,
  onEdit,
  onPayment,
  onAction,
  busy,
  disabled,
}: {
  booking: Booking;
  data: OwnerData;
  onClose: () => void;
  onEdit: () => void;
  onPayment: (k: "receipt" | "refund") => void;
  onAction: (b: Booking, k: "confirm" | "cancel", key: string) => Promise<void>;
  busy: boolean;
  disabled: boolean;
}) {
  const [tab, setTab] = useState("overview"),
    [cancel, setCancel] = useState(false),
    [error, setError] = useState("");
  const keys = useRef({
    confirm: crypto.randomUUID(),
    cancel: crypto.randomUUID(),
  });
  const blocking = b.payment === "block",
    m = moneyState(b, data.payments),
    payments = data.payments.filter((p) => p.booking_id === b.id),
    events = data.activity.filter((e) => e.booking_id === b.id),
    editable = isActive(b) && !["full", "deposit"].includes(b.payment);
  async function act(kind: "confirm" | "cancel") {
    setError("");
    try {
      await onAction(b, kind, keys.current[kind]);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal
      wide
      title={b.name}
      eyebrow={blocking ? "BLOCCO DEL CALENDARIO" : b.id}
      onClose={onClose}
      busy={busy}
    >
      <div className="cm-detail-meta">
        <Status booking={b} payments={data.payments} />
        <span>
          {blocking ? "Periodo chiuso alla vendita" : source(b.source)}
        </span>
      </div>
      <div className="cm-detail-dates">
        <div>
          <small>{blocking ? "BLOCCA DAL" : "ARRIVO"}</small>
          <strong>{day(b.checkin, true)}</strong>
        </div>
        <span>{dateRange(b.checkin, b.checkout, 365).length} notti</span>
        <div>
          <small>{blocking ? "RIAPRI IL" : "PARTENZA"}</small>
          <strong>{day(b.checkout, true)}</strong>
        </div>
      </div>
      <div className="cm-tabs" role="tablist" aria-label="Dettagli soggiorno">
        {[
          ["overview", "Riepilogo"],
          ...(!blocking ? [["payments", "Movimenti"]] : []),
          ["activity", "Attività"],
        ].map(([id, label]) => (
          <button
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "active" : ""}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div className="cm-detail-body">
          {!blocking && (
            <>
              <div className="cm-money-strip">
                <div>
                  <small>TOTALE</small>
                  <strong>{money(b.total)}</strong>
                </div>
                <div>
                  <small>REGISTRATO NETTO</small>
                  <strong>{money(m.paid)}</strong>
                </div>
                <div>
                  <small>
                    {m.refundReview ? "DA VALUTARE / RESTITUIRE" : "RESIDUO"}
                  </small>
                  <strong
                    className={
                      m.balance || m.refundReview ? "cm-text-amber" : ""
                    }
                  >
                    {money(m.refundReview || m.balance)}
                  </strong>
                </div>
              </div>
              <div className="cm-detail-facts">
                <span>
                  <b>{b.guests}</b> ospiti
                </span>
                <span>{source(b.source)}</span>
                <span>
                  Inserita il {new Date(b.created).toLocaleDateString("it-IT")}
                </span>
              </div>
              {(b.email || b.phone) && (
                <div className="cm-contact-links">
                  {b.email && (
                    <a href={"mailto:" + b.email}>
                      <Mail size={16} />
                      {b.email}
                    </a>
                  )}
                  {b.phone && (
                    <a href={"tel:" + b.phone}>
                      <Phone size={16} />
                      {b.phone}
                    </a>
                  )}
                </div>
              )}
            </>
          )}
          {b.notes && (
            <div className="cm-notes">
              <small>NOTE INTERNE</small>
              <p>{b.notes}</p>
            </div>
          )}
          {["airbnb", "booking"].includes(b.source) && (
            <p className="cm-help">
              Inserimento manuale. Nessuna sincronizzazione automatica con{" "}
              {b.source === "airbnb" ? "Airbnb" : "Booking.com"}.
            </p>
          )}
          {blocking && (
            <div className="cm-info-box">
              <LockKeyhole size={18} />
              <p>
                Queste notti non sono disponibili sul sito quando il calendario
                condiviso è attivo. Il giorno di riapertura resta libero.
              </p>
            </div>
          )}
          {m.refundReview > 0 && (
            <div className="cm-warning">
              <TriangleAlert size={18} />
              <p>
                Il soggiorno è annullato, ma risultano ancora{" "}
                {money(m.refundReview)}. Verifica le condizioni concordate e
                registra solo rimborsi già effettuati.
              </p>
            </div>
          )}
        </div>
      )}
      {tab === "payments" && (
        <div className="cm-detail-body">
          <div className="cm-money-strip">
            <div>
              <small>IMPORTO REGISTRATO</small>
              <strong>{money(m.paid)}</strong>
            </div>
            <div>
              <small>RIMBORSI ANNOTATI</small>
              <strong>{money(m.refunds)}</strong>
            </div>
          </div>
          {m.stripe > 0 && (
            <div className="cm-movement">
              <ArrowDownLeft size={19} />
              <div>
                <b>Stripe test · verificato dal server</b>
                <small>Pagamento associato a questa prenotazione</small>
              </div>
              <strong>{money(m.stripe)}</strong>
            </div>
          )}
          {payments.map((p) => (
            <div className="cm-movement" key={p.id}>
              {p.kind === "receipt" ? (
                <ArrowDownLeft size={19} />
              ) : (
                <ArrowUpRight size={19} />
              )}
              <div>
                <b>
                  {p.kind === "receipt"
                    ? "Incasso annotato"
                    : "Rimborso annotato"}{" "}
                  · {METHODS[p.method]}
                </b>
                <small>
                  {new Date(p.created).toLocaleString("it-IT")}
                  {p.note ? " · " + p.note : ""}
                </small>
              </div>
              <strong>
                {p.kind === "refund" ? "−" : ""}
                {money(p.amount)}
              </strong>
            </div>
          ))}
          {!payments.length && !m.stripe && (
            <Empty title="Nessun movimento registrato">
              Aggiungi un incasso soltanto dopo averlo ricevuto fuori dall’app.
            </Empty>
          )}
          <p className="cm-help">
            Riepilogo gestionale. Le annotazioni manuali non sono addebiti,
            bonifici o documenti fiscali.
          </p>
        </div>
      )}
      {tab === "activity" && (
        <div className="cm-detail-body">
          <div className="cm-activity-list">
            {events.map((e) => (
              <div key={e.id}>
                <History size={15} />
                <span>
                  <b>{EVENT_NAMES[e.event] || e.event}</b>
                  <small>{new Date(e.created).toLocaleString("it-IT")}</small>
                </span>
              </div>
            ))}
          </div>
          {!events.length && (
            <Empty title="Nessuna attività disponibile">
              Lo storico registra le operazioni eseguite con la nuova gestione.
            </Empty>
          )}
        </div>
      )}
      {cancel ? (
        <div className="cm-cancel-confirm">
          <h3>
            {blocking
              ? "Vuoi riaprire questo periodo?"
              : "Annullare e liberare le date?"}
          </h3>
          <p>
            Dal {day(b.checkin)} al {day(b.checkout)} il calendario tornerà
            disponibile.
            {m.paid > 0
              ? " Risultano " +
                money(m.paid) +
                " registrati: questa azione non esegue rimborsi."
              : ""}
          </p>
          <div className="cm-modal-actions">
            <button
              className="cm-button cm-button-quiet"
              onClick={() => setCancel(false)}
              disabled={busy}
            >
              Torna al dettaglio
            </button>
            <button
              className="cm-button cm-button-danger"
              onClick={() => act("cancel")}
              disabled={busy || disabled}
            >
              {blocking ? "Libera le date" : "Annulla prenotazione"}
            </button>
          </div>
        </div>
      ) : (
        <div className="cm-detail-actions">
          {b.status === "pending" && (
            <Primary
              onClick={() => act("confirm")}
              busy={busy}
              disabled={disabled}
            >
              <CheckCircle2 size={17} />
              Conferma richiesta
            </Primary>
          )}
          {editable && (
            <button
              className="cm-button cm-button-secondary"
              onClick={onEdit}
              disabled={busy || disabled}
            >
              <Pencil size={16} />
              {blocking ? "Modifica blocco" : "Modifica soggiorno"}
            </button>
          )}
          {!blocking &&
            m.balance > 0 &&
            b.status !== "awaiting_payment" &&
            isActive(b) && (
              <button
                className="cm-button cm-button-secondary"
                onClick={() => onPayment("receipt")}
                disabled={busy || disabled}
              >
                <Wallet size={16} />
                Registra incasso
              </button>
            )}
          {!blocking && m.paid > 0 && (
            <button
              className="cm-button cm-button-secondary"
              onClick={() => onPayment("refund")}
              disabled={busy || disabled}
            >
              <ArrowUpRight size={16} />
              Annota rimborso
            </button>
          )}
          {isActive(b) && (
            <button
              className="cm-text-button cm-destructive"
              onClick={() => setCancel(true)}
              disabled={busy || disabled}
            >
              {blocking ? "Libera periodo" : "Annulla prenotazione"}
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="cm-form-error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
