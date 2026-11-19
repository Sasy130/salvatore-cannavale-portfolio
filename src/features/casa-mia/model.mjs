// Date ranges are half-open: check-in is occupied; check-out is available again.
export const SOURCE_LABELS = {
  direct: "Sito diretto",
  phone: "Telefono / messaggio",
  airbnb: "Airbnb · manuale",
  booking: "Booking.com · manuale",
};
export const STATUS_LABELS = {
  pending: "Registrazione precedente",
  confirmed: "Confermata",
  blocked: "Date bloccate",
  awaiting_payment: "Pagamento in attesa",
  cancelled: "Annullata",
  expired: "Scaduta",
  payment_failed: "Pagamento non riuscito",
  payment_review_required: "Pagamento da verificare",
  cancelled_refund_required: "Rimborso da gestire",
};
export function isActive(b) {
  return ["pending", "confirmed", "blocked", "awaiting_payment"].includes(
    b.status,
  );
}
export function isCancelled(b) {
  return ["cancelled", "cancelled_refund_required"].includes(b.status);
}
export function dateRange(start, end, max = 365) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end || "")
  )
    throw Error("Scegli entrambe le date.");
  const a = new Date(start + "T00:00:00Z"),
    z = new Date(end + "T00:00:00Z");
  if (
    !Number.isFinite(+a) ||
    !Number.isFinite(+z) ||
    a.toISOString().slice(0, 10) !== start ||
    z.toISOString().slice(0, 10) !== end
  )
    throw Error("Controlla le date inserite.");
  const n = (+z - +a) / 86400000;
  if (n < 1 || n > max)
    throw Error(
      `Scegli un periodo da 1 a ${max} notti. La data finale deve essere successiva a quella iniziale.`,
    );
  return Array.from({ length: n }, (_, i) =>
    new Date(+a + i * 86400000).toISOString().slice(0, 10),
  );
}
export function addDays(date, n) {
  return new Date(new Date(date + "T00:00:00Z").getTime() + n * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function overlaps(a, b) {
  return a.checkin < b.checkout && a.checkout > b.checkin;
}
export function propertyToday() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((k) => parts.find((p) => p.type === k).value)
    .join("-");
}
export function parseMoney(value) {
  let s = String(value ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(s))
    throw Error("Usa un importo come 180 o 180,50, senza valori negativi.");
  const [whole, decimal = ""] = s.split(".");
  const result = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || result > 10000000)
    throw Error("Importo fuori limite.");
  return result;
}
export function moneyState(b, payments = []) {
  const stripe =
    ["full", "deposit"].includes(b.payment) &&
    [
      "confirmed",
      "cancelled_refund_required",
      "payment_review_required",
    ].includes(b.status)
      ? b.due
      : 0;
  const entries = payments.filter((p) => p.booking_id === b.id);
  const receipts = entries
      .filter((p) => p.kind === "receipt")
      .reduce((n, p) => n + p.amount, 0),
    refunds = entries
      .filter((p) => p.kind === "refund")
      .reduce((n, p) => n + p.amount, 0),
    paid = stripe + receipts - refunds;
  return {
    paid,
    receipts,
    refunds,
    stripe,
    balance:
      isActive(b) && b.payment !== "block" ? Math.max(0, b.total - paid) : 0,
    refundReview: isCancelled(b) ? Math.max(0, paid) : 0,
  };
}
export function occupancy(bookings, from, to) {
  const days = dateRange(from, to, 366),
    stays = new Set(),
    blocks = new Set();
  for (const b of bookings.filter(isActive)) {
    const target = b.payment === "block" ? blocks : stays;
    for (const d of days) if (d >= b.checkin && d < b.checkout) target.add(d);
  }
  return {
    occupied: stays.size,
    blocked: blocks.size,
    total: days.length,
    available: days.length - stays.size - blocks.size,
    percentage:
      days.length > blocks.size
        ? Math.round((stays.size / (days.length - blocks.size)) * 100)
        : 0,
  };
}
export function searchBookings(
  bookings,
  { search = "", status = "active", source = "all", from = "", to = "" } = {},
) {
  const clean = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const term = clean(search);
  return bookings
    .filter(
      (b) =>
        (status === "all" ||
          (status === "active" && isActive(b)) ||
          (status === "cancelled" && isCancelled(b)) ||
          b.status === status) &&
        (source === "all" || b.source === source) &&
        (!from || b.checkout > from) &&
        (!to || b.checkin < to) &&
        (!term ||
          clean(
            [
              b.name,
              b.email,
              b.phone,
              b.id,
              SOURCE_LABELS[b.source] || b.source,
            ].join(" "),
          ).includes(term)),
    )
    .sort((a, b) => a.checkin.localeCompare(b.checkin));
}
export function bookingsCSV(bookings, payments = []) {
  const cell = (v) => {
    let s = String(v ?? "");
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const rows = [
    [
      "Riferimento",
      "Ospite",
      "Arrivo",
      "Partenza",
      "Ospiti",
      "Canale",
      "Stato",
      "Totale EUR",
      "Registrato EUR",
      "Residuo EUR",
      "Email",
      "Telefono",
    ],
    ...bookings.map((b) => {
      const m = moneyState(b, payments);
      return [
        b.id,
        b.name,
        b.checkin,
        b.checkout,
        b.guests,
        SOURCE_LABELS[b.source] || b.source,
        STATUS_LABELS[b.status] || b.status,
        (b.total / 100).toFixed(2),
        (m.paid / 100).toFixed(2),
        (m.balance / 100).toFixed(2),
        b.email,
        b.phone,
      ];
    }),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
// Owner agreements may differ from the website's minimum stay; physical capacity still applies.
export function ownerQuote(input, settings) {
  const dates = dateRange(input.checkin, input.checkout, 365);
  if (
    !Number.isInteger(Number(input.guests)) ||
    Number(input.guests) < 1 ||
    Number(input.guests) > 4
  )
    throw Error("La casa può accogliere da 1 a 4 ospiti.");
  const subtotal = dates.reduce(
    (sum, d) =>
      sum +
      ([6, 7, 8, 9].includes(Number(d.slice(5, 7)))
        ? settings.summerRate
        : settings.baseRate),
    0,
  );
  return {
    nights: dates.length,
    subtotal,
    cleaning: settings.cleaning,
    total: subtotal + settings.cleaning,
  };
}

export function stayOperations(b) {
  try {
    const o = JSON.parse(b.operations || "{}");
    return {
      roomReady: !!o.roomReady,
      guestArrived: !!o.guestArrived,
      guestDeparted: !!o.guestDeparted,
    };
  } catch {
    return { roomReady: false, guestArrived: false, guestDeparted: false };
  }
}
export function updateStayOperations(b, field, value, today = propertyToday()) {
  if (b.status !== "confirmed" || b.payment === "block")
    throw Error(
      "Le operazioni sono disponibili solo per soggiorni confermati.",
    );
  if (
    !["roomReady", "guestArrived", "guestDeparted"].includes(field) ||
    typeof value !== "boolean"
  )
    throw Error("Operazione non valida.");
  const o = stayOperations(b);
  if (field !== "roomReady" && value && today < b.checkin)
    throw Error(
      "Puoi registrare l’arrivo o la partenza dal giorno di check-in.",
    );
  if (field === "guestDeparted" && value && !o.guestArrived)
    throw Error("Registra prima il check-in.");
  if (field === "guestArrived" && !value && o.guestDeparted)
    throw Error("Annulla prima la registrazione del check-out.");
  return { ...o, [field]: value };
}
export function operationsAfterEdit(existing, input) {
  if (!existing) return "{}";
  if (
    existing.checkin === input.checkin &&
    existing.checkout === input.checkout
  )
    return existing.operations || "{}";
  if (stayOperations(existing).guestArrived)
    throw Error(
      "Per cambiare le date, annulla prima le registrazioni di check-out e check-in.",
    );
  return "{}";
}
export function stayCalendarFile(b) {
  const escape = (v) =>
    String(v ?? "")
      .replaceAll("\\", "\\\\")
      .replaceAll("\r", "")
      .replaceAll("\n", "\\n")
      .replaceAll(";", "\\;")
      .replaceAll(",", "\\,");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DIMORA MIA//Owner Calendar//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + escape(b.id) + "@casa-mia",
    "DTSTAMP:" +
      new Date(b.created)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, ""),
    "DTSTART;VALUE=DATE:" + b.checkin.replaceAll("-", ""),
    "DTEND;VALUE=DATE:" + b.checkout.replaceAll("-", ""),
    "SUMMARY:" + escape("DIMORA MIA · " + b.name),
    "DESCRIPTION:" +
      escape(
        "Copia statica del soggiorno. Modifiche e annullamenti non si sincronizzano. Riferimento: " +
          b.id,
      ),
    "STATUS:" + (isCancelled(b) ? "CANCELLED" : "CONFIRMED"),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => {
        let result = "",
          bytes = 0;
        for (const c of line) {
          const size = new TextEncoder().encode(c).length;
          if (bytes + size > 73) {
            result += "\r\n ";
            bytes = 1;
          }
          result += c;
          bytes += size;
        }
        return result;
      })
      .join("\r\n") + "\r\n"
  );
}
