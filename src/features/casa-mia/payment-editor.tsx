"use client";
import { useRef, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { moneyState, parseMoney } from "./model.mjs";
import { Modal, Primary, money } from "./ui";
import type { Booking, Payment, PaymentInput } from "./types";
export function PaymentEditor({
  booking,
  payments,
  kind,
  onSave,
  onClose,
  demo,
}: {
  booking: Booking;
  payments: Payment[];
  kind: "receipt" | "refund";
  onSave: (p: PaymentInput) => Promise<void>;
  onClose: () => void;
  demo: boolean;
}) {
  const m = moneyState(booking, payments),
    limit = kind === "receipt" ? m.balance : m.paid;
  const [amount, setAmount] = useState(String(limit / 100).replace(".", ",")),
    [method, setMethod] = useState("bank"),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  function changed() {
    key.current = crypto.randomUUID();
    setError("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const value = parseMoney(amount);
      if (!value || value > limit)
        throw Error(
          "L’importo deve essere positivo e non superare " + money(limit) + ".",
        );
      await onSave({
        bookingId: booking.id,
        kind,
        amount: value,
        method,
        note,
        idempotency: key.current,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={kind === "receipt" ? "Registra un incasso" : "Annota un rimborso"}
      eyebrow={booking.name}
      onClose={onClose}
      busy={busy}
    >
      <div className="cm-info-box">
        <Info size={18} />
        <p>
          {demo
            ? "Questa è una simulazione: nessun denaro viene spostato."
            : kind === "receipt"
              ? "Registra solo un importo che hai già ricevuto. L’app non addebita carte e non esegue bonifici."
              : "Registra solo un rimborso già effettuato con il metodo scelto. L’app non restituisce denaro automaticamente."}
        </p>
      </div>
      <form onSubmit={submit}>
        <div className="cm-payment-limit">
          <span>
            {kind === "receipt"
              ? "Saldo ancora da registrare"
              : "Importo registrato disponibile"}
          </span>
          <strong>{money(limit)}</strong>
        </div>
        <label>
          Importo (€)
          <input
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              changed();
            }}
          />
        </label>
        <label>
          Metodo utilizzato
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              changed();
            }}
          >
            <option value="bank">Bonifico</option>
            <option value="cash">Contanti</option>
            <option value="pos">POS esterno</option>
            <option value="other">Altro metodo</option>
          </select>
        </label>
        <label>
          {kind === "refund" ? "Motivo del rimborso" : "Nota o riferimento"}{" "}
          <span>{kind === "refund" ? "obbligatorio" : "facoltativo"}</span>
          <textarea
            value={note}
            rows={3}
            required={kind === "refund"}
            maxLength={500}
            onChange={(e) => {
              setNote(e.target.value);
              changed();
            }}
          />
        </label>
        <p className="cm-help">
          Annotazione gestionale, non documento fiscale. Il metodo “POS esterno”
          indica un pagamento avvenuto fuori dall’app.
        </p>
        {error && (
          <p className="cm-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="cm-modal-actions">
          <button
            className="cm-button cm-button-quiet"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Annulla
          </button>
          <Primary type="submit" busy={busy}>
            Registra {kind === "receipt" ? "incasso" : "rimborso"}{" "}
            <CheckCircle2 size={17} />
          </Primary>
        </div>
      </form>
    </Modal>
  );
}
