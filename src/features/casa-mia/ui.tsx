"use client";
import { useEffect, useId, useRef } from "react";
import { X, LoaderCircle } from "lucide-react";
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
