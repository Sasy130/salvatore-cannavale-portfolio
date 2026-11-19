"use client";
import { useEffect, useId, useRef } from "react";
import { X, ArrowUpRight, LoaderCircle } from "lucide-react";
import { STATUS_LABELS, SOURCE_LABELS, moneyState } from "./model.mjs";
import type { Booking, Payment } from "./types";
export const money = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n / 100);
export const day = (date: string, full = false) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("it-IT", {
    day: "numeric",
    month: full ? "long" : "short",
    ...(full ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  });
export const source = (name: string) =>
  (SOURCE_LABELS as Record<string, string>)[name] || "Inserimento manuale";
export function statusName(b: Booking, payments: Payment[] = []) {
  return b.status === "cancelled_refund_required" &&
    moneyState(b, payments).paid === 0
    ? "Annullata · saldo chiuso"
    : (STATUS_LABELS as Record<string, string>)[b.status] || b.status;
}
export function Status({
  booking,
  payments = [],
}: {
  booking: Booking;
  payments?: Payment[];
}) {
  return (
    <span className={"cm-status " + booking.status}>
      {statusName(booking, payments)}
    </span>
  );
}
export function Brand() {
  return (
    <a
      href="/casa-mia/gestione"
      className="cm-brand"
      aria-label="CASA MIA, gestione"
    >
      <span className="cm-brand-symbol" aria-hidden="true">
        cm
      </span>
      <span>
        CASA MIA<small>PROPERTY MANAGER</small>
      </span>
    </a>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="cm-empty">
      <span className="cm-empty-mark" aria-hidden="true">
        ◇
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Modal({
  title,
  eyebrow,
  children,
  onClose,
  busy = false,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const dialog = ref.current,
      previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"cm-modal " + (wide ? "cm-modal-wide" : "")}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="cm-modal-head">
        <div>
          {eyebrow && <span className="cm-kicker">{eyebrow}</span>}
          <h2 id={id}>{title}</h2>
        </div>
        <button
          className="cm-icon-button"
          onClick={onClose}
          disabled={busy}
          aria-label="Chiudi finestra"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Primary({
  children,
  busy = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      className={"cm-button cm-button-primary " + (props.className || "")}
      disabled={props.disabled || busy}
    >
      {busy ? <LoaderCircle className="cm-spin" size={17} /> : null}
      {children}
    </button>
  );
}
export function InstallHelp({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="La tua casa, a portata di mano."
      eyebrow="INSTALLA L’APP"
      onClose={onClose}
    >
      <p className="cm-modal-intro">
        Aggiungi CASA MIA alla schermata Home. Si apre come un’app e non
        richiede uno store.
      </p>
      <div className="cm-instruction">
        <b>01 / iPhone</b>
        <p>
          Apri in Safari, tocca <strong>Condividi</strong>, poi{" "}
          <strong>Aggiungi alla schermata Home</strong>.
        </p>
      </div>
      <div className="cm-instruction">
        <b>02 / Android</b>
        <p>
          Apri in Chrome, tocca il menù e scegli <strong>Installa app</strong>{" "}
          oppure <strong>Aggiungi a schermata Home</strong>.
        </p>
      </div>
      <p className="cm-help">
        Per il calendario condiviso serve internet. La demo rimane separata dai
        dati reali. Se stai usando l’anteprima nel portfolio, apri prima una
        pagina separata.
      </p>
      <a
        className="cm-button cm-button-primary"
        href="/casa-mia/gestione"
        target="_blank"
        rel="noopener noreferrer"
      >
        Apri l’app separatamente <ArrowUpRight size={17} />
      </a>
    </Modal>
  );
}
