import { defaults } from "./server/booking.mjs";
import {
  dateRange,
  addDays,
  propertyToday,
  moneyState,
  isActive,
  ownerQuote,
} from "./model.mjs";
import type {
  OwnerData,
  ReservationInput,
  Preview,
  PaymentInput,
  Booking,
} from "./types";
export const DEMO_KEY = "casa-mia:owner-console:v2";
const id = () => crypto.randomUUID();
export function demoData(): OwnerData {
  const today = propertyToday();
  function booking(
    offset: number,
    nights: number,
    name: string,
    status: string,
    source: string,
    total = 60000,
  ): Booking {
    return {
      id: "DEMO-" + id().slice(0, 6).toUpperCase(),
      checkin: addDays(today, offset),
      checkout: addDays(today, offset + nights),
      name,
      guests: 2,
      email: "ospite@example.test",
      phone: "",
      notes: "Dati di esempio per esplorare la gestione della casa.",
      source,
      total,
      due: total,
      payment: status === "blocked" ? "block" : "arrival",
      status,
      created: new Date().toISOString(),
      revision: 1,
    };
  }
  const bookings = [
    booking(0, 2, "Ospite di esempio", "confirmed", "phone"),
    booking(4, 3, "Richiesta dimostrativa", "pending", "direct"),
    booking(10, 4, "Soggiorno di esempio", "confirmed", "airbnb", 78000),
    booking(18, 2, "Manutenzione programmata", "blocked", "phone", 0),
  ];
  const created = new Date().toISOString();
  return {
    bookings,
    payments: [
      {
        id: id(),
        booking_id: bookings[0].id,
        kind: "receipt",
        amount: 20000,
        method: "bank",
        note: "Acconto di esempio, nessun movimento reale.",
        created,
        idempotency: id(),
      },
    ],
    activity: bookings.map((b) => ({
      id: id(),
      booking_id: b.id,
      event: b.payment === "block" ? "dates_blocked" : "reservation_created",
      details: JSON.stringify({ source: b.source }),
      created,
    })),
    settings: {
      ...defaults,
      assets: {
        living: "/demos/dimora-mia/assets/living.webp",
        bedroom: "/demos/dimora-mia/assets/bedroom.webp",
        terrace: "/demos/dimora-mia/assets/terrace.webp",
      },
    },
    stripeReady: false,
    emailReady: false,
    schemaVersion: 2,
    actions: {},
  };
}
export function loadDemo(): OwnerData {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY) || "null");
    if (
      saved?.schemaVersion === 2 &&
      Array.isArray(saved.bookings) &&
      Array.isArray(saved.payments) &&
      Array.isArray(saved.activity)
    )
      return demoWithWebsite(saved);
  } catch {}
  return demoWithWebsite(demoData());
}
export function previewDemo(data: OwnerData, input: ReservationInput): Preview {
  const existing = data.bookings.find((b) => b.id === input.bookingId);
  if (input.bookingId && !existing) throw Error("Soggiorno non trovato.");
  if (
    existing &&
    (!isActive(existing) || ["full", "deposit"].includes(existing.payment))
  )
    throw Error("Questo soggiorno non può essere modificato.");
  if (existing && (existing.payment === "block") !== (input.kind === "block"))
    throw Error("Il tipo di inserimento non può cambiare.");
  const blocking = input.kind === "block",
    dates = dateRange(input.checkin, input.checkout, 365);
  if (
    input.checkin < propertyToday() &&
    (!existing || input.checkin !== existing.checkin)
  )
    throw Error("La data iniziale non può essere nel passato.");
  const q = blocking
    ? { total: 0, subtotal: 0, cleaning: 0 }
    : ownerQuote(input, data.settings);
  const total = blocking ? 0 : (input.amount ?? q.total),
    registered = existing ? moneyState(existing, data.payments).paid : 0;
  const conflicts = data.bookings.filter(
    (b) =>
      b.id !== input.bookingId &&
      isActive(b) &&
      input.checkin < b.checkout &&
      input.checkout > b.checkin,
  );
  const ruleBlocks = data.settings.blockedDates.filter(
    (d) => d >= input.checkin && d < input.checkout,
  );
  return {
    ok: !conflicts.length && !ruleBlocks.length && total >= registered,
    conflicts,
    ruleBlocks,
    nights: dates.length,
    checkin: input.checkin,
    checkout: input.checkout,
    lastNight: dates.at(-1)!,
    total,
    subtotal: q.subtotal,
    cleaning: q.cleaning,
    registered,
    financialConflict: total < registered,
  };
}
function log(data: OwnerData, b: Booking, event: string, details: object = {}) {
  data.activity.unshift({
    id: id(),
    booking_id: b.id,
    event,
    details: JSON.stringify(details),
    created: new Date().toISOString(),
  });
  data.activity = data.activity.slice(0, 150);
}
function retry(data: OwnerData, input: { idempotency: string }) {
  const fingerprint = JSON.stringify(input),
    previous = data.actions?.[input.idempotency];
  if (previous && previous.fingerprint !== fingerprint)
    throw Error("Richiesta già associata ad altri dati. Riapri il modulo.");
  return { fingerprint, previous };
}
export function saveDemo(data: OwnerData, input: ReservationInput): OwnerData {
  const next = structuredClone(data),
    r = retry(next, input);
  if (r.previous) return next;
  const existing = next.bookings.find((b) => b.id === input.bookingId);
  if (existing && existing.revision !== input.revision)
    throw Error("Questo soggiorno è stato aggiornato. Riapri il dettaglio.");
  const p = previewDemo(next, input);
  if (!p.ok)
    throw Error(
      p.financialConflict
        ? "Il totale non può essere inferiore agli incassi registrati."
        : "Date occupate: nessuna modifica salvata.",
    );
  if (!input.name.trim()) throw Error("Indica un nome o il motivo del blocco.");
  const b: Booking = {
    id: existing?.id || "DEMO-" + id().slice(0, 8).toUpperCase(),
    ...existing,
    checkin: input.checkin,
    checkout: input.checkout,
    guests: input.kind === "block" ? 1 : input.guests,
    name: input.name.trim(),
    email: input.email,
    phone: input.phone,
    notes: input.notes,
    source: input.source,
    total: p.total,
    due: p.total,
    payment: input.kind === "block" ? "block" : "arrival",
    status:
      existing?.status || (input.kind === "block" ? "blocked" : "confirmed"),
    created: existing?.created || new Date().toISOString(),
    revision: (existing?.revision || 0) + 1,
  };
  next.bookings = existing
    ? next.bookings.map((x) => (x.id === b.id ? b : x))
    : [b, ...next.bookings];
  log(
    next,
    b,
    existing
      ? "reservation_updated"
      : input.kind === "block"
        ? "dates_blocked"
        : "reservation_created",
    { checkin: b.checkin, checkout: b.checkout, total: b.total },
  );
  next.actions = {
    ...next.actions,
    [input.idempotency]: { fingerprint: r.fingerprint, response: { id: b.id } },
  };
  return next;
}
export function paymentDemo(data: OwnerData, input: PaymentInput): OwnerData {
  const next = structuredClone(data),
    r = retry(next, input);
  if (r.previous) return next;
  const b = next.bookings.find((b) => b.id === input.bookingId);
  if (!b || b.payment === "block") throw Error("Soggiorno non valido.");
  const m = moneyState(b, next.payments);
  if (!Number.isInteger(input.amount) || input.amount <= 0)
    throw Error("Inserisci un importo positivo.");
  if (
    input.kind === "receipt" &&
    (!isActive(b) ||
      b.status === "awaiting_payment" ||
      input.amount > m.balance)
  )
    throw Error("L’incasso supera il residuo o il soggiorno non è attivo.");
  if (input.kind === "refund" && (input.amount > m.paid || !input.note.trim()))
    throw Error("Controlla l’importo del rimborso e indica una nota.");
  const entry = {
    ...input,
    id: id(),
    booking_id: b.id,
    created: new Date().toISOString(),
  };
  next.payments.unshift(entry);
  b.revision++;
  log(
    next,
    b,
    input.kind === "receipt" ? "payment_recorded" : "refund_recorded",
    { amount: input.amount, method: input.method },
  );
  next.actions = {
    ...next.actions,
    [input.idempotency]: {
      fingerprint: r.fingerprint,
      response: { id: entry.id },
    },
  };
  return next;
}
export function actionDemo(
  data: OwnerData,
  input: {
    id: string;
    revision: number;
    action: "confirm" | "cancel";
    idempotency: string;
  },
): OwnerData {
  const next = structuredClone(data),
    r = retry(next, input);
  if (r.previous) return next;
  const b = next.bookings.find((b) => b.id === input.id);
  if (!b || b.revision !== input.revision)
    throw Error("Questo soggiorno è cambiato. Aggiorna il dettaglio.");
  if (input.action === "confirm") {
    if (b.status !== "pending")
      throw Error("La richiesta non è più da confermare.");
    b.status = "confirmed";
  } else {
    if (!isActive(b)) throw Error("Il soggiorno non è attivo.");
    b.status = moneyState(b, next.payments).paid > 0 ? "cancelled_refund_required" : "cancelled";
  }
  b.revision++;
  log(
    next,
    b,
    input.action === "confirm"
      ? "reservation_confirmed"
      : "reservation_cancelled",
  );
  next.actions = {
    ...next.actions,
    [input.idempotency]: { fingerprint: r.fingerprint, response: { id: b.id } },
  };
  return next;
}
export const SITE_DEMO_KEY = "dimora-mia:portfolio:v1";
export function syncDemo(data: OwnerData) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(data));
  localStorage.setItem(
    SITE_DEMO_KEY,
    JSON.stringify({ settings: data.settings, bookings: data.bookings }),
  );
}
export function demoWithWebsite(base: OwnerData): OwnerData {
  let site: {
    bookings?: Partial<Booking>[];
    settings?: Partial<OwnerData["settings"]>;
  } | null = null;
  try {
    site = JSON.parse(localStorage.getItem(SITE_DEMO_KEY) || "null");
  } catch {}
  if (!Array.isArray(site?.bookings)) return base;
  const local = site.bookings
    .filter(
      (b) =>
        typeof b.id === "string" &&
        typeof b.checkin === "string" &&
        typeof b.checkout === "string" &&
        typeof b.name === "string",
    )
    .map(
      (b) =>
        ({
          email: "",
          phone: "",
          notes: "",
          source: "direct",
          revision: 1,
          ...b,
        }) as Booking,
    );
  const ids = new Set(local.map((b) => b.id));
  const additional = base.bookings.filter(
    (b) =>
      !ids.has(b.id) &&
      !local.some(
        (x) =>
          isActive(x) &&
          isActive(b) &&
          x.checkin < b.checkout &&
          x.checkout > b.checkin,
      ),
  );
  const bookings = [...local, ...additional],
    valid = new Set(bookings.map((b) => b.id));
  return {
    ...base,
    bookings,
    payments: base.payments.filter((p) => valid.has(p.booking_id)),
    activity: base.activity.filter((e) => valid.has(e.booking_id)),
    settings: {
      ...base.settings,
      ...site.settings,
      fullOnline: false,
      depositOnline: false,
    },
  };
}
