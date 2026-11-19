import { defaults } from "./booking.mjs";
import {
  dateRange,
  propertyToday,
  moneyState,
  isActive,
  ownerQuote,
  updateStayOperations,
  operationsAfterEdit,
} from "../model.mjs";
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
const all = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
const one = async (db, sql, ...args) => (await all(db, sql, ...args))[0];
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
const now = () => new Date().toISOString();
async function read(req) {
  const text = await req.text();
  if (text.length > 20000) throw fail("Richiesta troppo grande.");
  return JSON.parse(text);
}
async function config(db) {
  return {
    ...structuredClone(defaults),
    ...JSON.parse(
      (await one(db, "SELECT value FROM settings WHERE id=1"))?.value || "{}",
    ),
  };
}
export async function activity(db, id, event, details = {}) {
  await db
    .prepare(
      "INSERT INTO owner_activity(id,booking_id,event,details,created) VALUES(?,?,?,?,?)",
    )
    .bind(crypto.randomUUID(), id, event, JSON.stringify(details), now())
    .run();
}
async function fingerprint(input) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(input)),
  );
  return [...new Uint8Array(bytes)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
async function retry(db, input) {
  if (!/^[\w-]{16,80}$/.test(input.idempotency || ""))
    throw fail("Riferimento richiesta non valido.");
  const previous = await one(
      db,
      "SELECT * FROM owner_actions WHERE idempotency=?",
      input.idempotency,
    ),
    hash = await fingerprint(input);
  if (previous) {
    if (previous.fingerprint !== hash)
      throw fail(
        "Questa richiesta è già associata ad altri dati. Riapri il modulo.",
        409,
      );
    return { hash, response: JSON.parse(previous.response) };
  }
  return { hash, response: null };
}
async function remember(db, input, hash, id, response) {
  await db
    .prepare(
      "INSERT INTO owner_actions(idempotency,fingerprint,booking_id,response,created) VALUES(?,?,?,?,?)",
    )
    .bind(input.idempotency, hash, id, JSON.stringify(response), now())
    .run();
}
async function plan(db, input) {
  const existing = input.bookingId
    ? await one(db, "SELECT * FROM bookings WHERE id=?", input.bookingId)
    : null;
  if (input.bookingId && !existing)
    throw fail("Prenotazione non trovata.", 404);
  if (
    existing &&
    (!isActive(existing) || ["full", "deposit"].includes(existing.payment))
  )
    throw fail(
      "Questo soggiorno non può essere modificato da qui. Verifica prima lo stato o il pagamento online.",
      409,
    );
  operationsAfterEdit(existing, input);
  const blocking = input.kind === "block";
  if (existing && (existing.payment === "block") !== blocking)
    throw fail("Il tipo di inserimento non può essere cambiato.");
  const dates = dateRange(input.checkin, input.checkout, 365);
  if (
    input.checkin < propertyToday() &&
    (!existing || input.checkin !== existing.checkin)
  )
    throw fail("La data iniziale non può essere nel passato.");
  const s = await config(db);
  const q = blocking
    ? { total: 0, subtotal: 0, cleaning: 0, nights: dates.length }
    : ownerQuote(input, s);
  let total = q.total;
  if (!blocking && input.amount !== undefined && input.amount !== null) {
    if (
      !Number.isInteger(input.amount) ||
      input.amount < 0 ||
      input.amount > 10000000
    )
      throw fail("Totale non valido.");
    total = input.amount;
  }
  const conflicts = await all(
    db,
    "SELECT DISTINCT b.id,b.name,b.checkin,b.checkout,b.status FROM nights n JOIN bookings b ON b.id=n.booking_id WHERE n.date>=? AND n.date<? AND n.booking_id<>?",
    input.checkin,
    input.checkout,
    existing?.id || "",
  );
  const rules = s.blockedDates.filter(
    (d) => d >= input.checkin && d < input.checkout,
  );
  const payments = existing
    ? await all(
        db,
        "SELECT * FROM owner_payments WHERE booking_id=?",
        existing.id,
      )
    : [];
  const registered = existing ? moneyState(existing, payments).paid : 0;
  return {
    ok: !conflicts.length && !rules.length && total >= registered,
    conflicts,
    ruleBlocks: rules,
    nights: dates.length,
    checkin: input.checkin,
    checkout: input.checkout,
    lastNight: dates.at(-1),
    total,
    subtotal: q.subtotal,
    cleaning: q.cleaning,
    registered,
    financialConflict: total < registered,
    dates,
    existing,
    blocking,
  };
}
function validateGuest(input) {
  if (
    typeof input.name !== "string" ||
    input.name.trim().length < 2 ||
    input.name.length > 100
  )
    throw fail("Inserisci un nome o un motivo del blocco.");
  for (const [key, max] of [
    ["email", 150],
    ["phone", 50],
    ["notes", 1000],
  ])
    if (
      typeof (input[key] || "") !== "string" ||
      (input[key] || "").length > max
    )
      throw fail("Contatti o note non validi.");
  if (input.email && !/^\S+@\S+\.\S+$/.test(input.email))
    throw fail("Email non valida.");
}
export async function handleOwnerOperation(path, req, env) {
  const db = env.DB;
  try {
    if (path === "admin/console" && req.method === "GET") {
      const [bookings, payments, events, s] = await Promise.all([
        all(db, "SELECT * FROM bookings ORDER BY checkin DESC LIMIT 2000"),
        all(
          db,
          "SELECT * FROM owner_payments ORDER BY created DESC LIMIT 4000",
        ),
        all(db, "SELECT * FROM owner_activity ORDER BY created DESC LIMIT 150"),
        config(db),
      ]);
      return json({
        bookings,
        payments,
        activity: events,
        settings: { ...s, manualConfirmation: false },
        stripeReady:
          !!env.STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
          !!env.STRIPE_WEBHOOK_SECRET,
        emailReady: !!env.RESEND_API_KEY && !!env.MAIL_FROM,
        schemaVersion: 3,
      });
    }
    if (req.method !== "POST")
      return json({ error: "Metodo non consentito." }, 405);
    const input = await read(req);
    if (path === "admin/operations") {
      const result = await db.transaction(async (tx) => {
        const previous = await retry(tx, input);
        if (previous.response) return previous.response;
        const b = await one(
          tx,
          "SELECT * FROM bookings WHERE id=? FOR UPDATE",
          input.id,
        );
        if (!b) throw fail("Soggiorno non trovato.", 404);
        if (b.revision !== input.revision)
          throw fail(
            "Il soggiorno è cambiato. Aggiorna prima di riprovare.",
            409,
          );
        const operations = updateStayOperations(b, input.field, input.value);
        await tx
          .prepare(
            "UPDATE bookings SET operations=?,revision=revision+1 WHERE id=?",
          )
          .bind(JSON.stringify(operations), b.id)
          .run();
        await activity(tx, b.id, "stay_operation_updated", {
          field: input.field,
          value: input.value,
        });
        const response = {
          ok: true,
          id: b.id,
          operations,
          revision: b.revision + 1,
        };
        await remember(tx, input, previous.hash, b.id, response);
        return response;
      });
      return json(result);
    }
    if (path === "admin/preview") {
      const p = await plan(db, input);
      const { dates, existing, blocking, ...result } = p;
      return json(result);
    }
    if (path === "admin/reservations") {
      validateGuest(input);
      const response = await db.transaction(async (tx) => {
        const previous = await retry(tx, input);
        if (previous.response) return previous.response;
        if (input.bookingId) {
          const current = await one(
            tx,
            "SELECT * FROM bookings WHERE id=? FOR UPDATE",
            input.bookingId,
          );
          if (!current) throw fail("Prenotazione non trovata.", 404);
          if (
            !Number.isInteger(input.revision) ||
            current.revision !== input.revision
          )
            throw fail(
              "Un altro dispositivo ha aggiornato questo soggiorno. Ricarica il dettaglio prima di modificare.",
              409,
            );
        }
        const p = await plan(tx, input);
        if (!p.ok)
          throw fail(
            p.financialConflict
              ? "Il nuovo totale è inferiore agli incassi registrati. Verifica prima l’eventuale rimborso."
              : "Le date si sovrappongono a una prenotazione o a un blocco. Nessuna modifica salvata.",
            409,
          );
        const id =
          p.existing?.id ||
          "CM-" +
            crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
        const source = ["direct", "phone", "airbnb", "booking"].includes(
          input.source,
        )
          ? input.source
          : "phone";
        if (p.existing) {
          await tx
            .prepare("DELETE FROM nights WHERE booking_id=?")
            .bind(id)
            .run();
          await tx
            .prepare(
              "UPDATE bookings SET checkin=?,checkout=?,guests=?,name=?,email=?,phone=?,notes=?,source=?,total=?,due=?,operations=?,revision=revision+1 WHERE id=?",
            )
            .bind(
              input.checkin,
              input.checkout,
              p.blocking ? 1 : Number(input.guests),
              input.name.trim(),
              input.email || "",
              input.phone || "",
              input.notes || "",
              source,
              p.total,
              p.total,
              operationsAfterEdit(p.existing, input),
              id,
            )
            .run();
        } else {
          await tx
            .prepare(
              "INSERT INTO bookings(id,checkin,checkout,guests,name,email,phone,notes,source,total,due,payment,status,created,idempotency) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            )
            .bind(
              id,
              input.checkin,
              input.checkout,
              p.blocking ? 1 : Number(input.guests),
              input.name.trim(),
              input.email || "",
              input.phone || "",
              input.notes || "",
              source,
              p.total,
              p.total,
              p.blocking ? "block" : "arrival",
              p.blocking ? "blocked" : "confirmed",
              now(),
              input.idempotency,
            )
            .run();
        }
        for (const d of p.dates)
          await tx
            .prepare("INSERT INTO nights(date,booking_id) VALUES(?,?)")
            .bind(d, id)
            .run();
        await activity(
          tx,
          id,
          p.existing
            ? "reservation_updated"
            : p.blocking
              ? "dates_blocked"
              : "reservation_created",
          {
            checkin: input.checkin,
            checkout: input.checkout,
            total: p.total,
            source,
          },
        );
        const result = {
          ok: true,
          id,
          revision: (p.existing?.revision || 0) + 1,
        };
        await remember(tx, input, previous.hash, id, result);
        return result;
      });
      return json(response, 201);
    }
    if (path === "admin/actions") {
      if (!["confirm", "cancel"].includes(input.action))
        throw fail("Azione non valida.");
      const cached = await retry(db, input);
      if (cached.response) return json(cached.response);
      const snapshot = await one(
        db,
        "SELECT * FROM bookings WHERE id=?",
        input.id,
      );
      if (!snapshot) throw fail("Soggiorno non trovato.", 404);
      if (snapshot.revision !== input.revision)
        throw fail("Questo soggiorno è cambiato. Riapri il dettaglio.", 409);
      if (
        input.action === "cancel" &&
        snapshot.status === "awaiting_payment" &&
        snapshot.stripe_session
      ) {
        try {
          await env.expireCheckout(snapshot.stripe_session);
        } catch {
          throw fail(
            "La sessione di pagamento non può essere chiusa. Verifica Stripe prima di liberare le date.",
            409,
          );
        }
      }
      let notify = null;
      const response = await db.transaction(async (tx) => {
        const previous = await retry(tx, input);
        if (previous.response) return previous.response;
        const b = await one(
          tx,
          "SELECT * FROM bookings WHERE id=? FOR UPDATE",
          input.id,
        );
        if (!b || b.revision !== input.revision)
          throw fail(
            "Questo soggiorno è stato modificato. Riapri il dettaglio aggiornato.",
            409,
          );
        let status;
        if (input.action === "confirm") {
          if (b.status !== "pending")
            throw fail("Questa richiesta non è più in attesa.", 409);
          status = "confirmed";
          notify = { ...b, status };
        } else {
          if (!isActive(b) && b.status !== "payment_review_required")
            throw fail("Il soggiorno non è attivo.", 409);
          const paid = moneyState(
            b,
            await all(
              tx,
              "SELECT * FROM owner_payments WHERE booking_id=?",
              b.id,
            ),
          ).paid;
          status = paid > 0 ? "cancelled_refund_required" : "cancelled";
          await tx
            .prepare("DELETE FROM nights WHERE booking_id=?")
            .bind(b.id)
            .run();
        }
        await tx
          .prepare(
            "UPDATE bookings SET status=?,expires=NULL,revision=revision+1 WHERE id=?",
          )
          .bind(status, b.id)
          .run();
        await activity(
          tx,
          b.id,
          input.action === "confirm"
            ? "reservation_confirmed"
            : "reservation_cancelled",
        );
        const result = { ok: true, id: b.id, status };
        await remember(tx, input, previous.hash, b.id, result);
        return result;
      });
      const emailSent = notify
        ? (await env.sendMail?.(notify)) || false
        : false;
      return json({ ...response, emailSent });
    }
    if (path === "admin/payments") {
      if (
        !["receipt", "refund"].includes(input.kind) ||
        !["cash", "bank", "pos", "other"].includes(input.method) ||
        !Number.isInteger(input.amount) ||
        input.amount <= 0 ||
        input.amount > 10000000
      )
        throw fail("Controlla importo e modalità del movimento.");
      if (
        typeof (input.note || "") !== "string" ||
        (input.note || "").length > 500 ||
        (input.kind === "refund" && (input.note || "").trim().length < 2)
      )
        throw fail("Indica una nota valida; per i rimborsi è obbligatoria.");
      const response = await db.transaction(async (tx) => {
        const previous = await retry(tx, input);
        if (previous.response) return previous.response;
        const b = await one(
          tx,
          "SELECT * FROM bookings WHERE id=? FOR UPDATE",
          input.bookingId,
        );
        if (!b || b.payment === "block") throw fail("Soggiorno non valido.");
        const entries = await all(
            tx,
            "SELECT * FROM owner_payments WHERE booking_id=?",
            b.id,
          ),
          m = moneyState(b, entries);
        if (
          input.kind === "receipt" &&
          (!isActive(b) ||
            b.status === "awaiting_payment" ||
            input.amount > m.balance)
        )
          throw fail(
            "L’importo supera il saldo residuo oppure il soggiorno non può ricevere incassi manuali.",
            409,
          );
        if (input.kind === "refund" && input.amount > m.paid)
          throw fail("Il rimborso supera quanto risulta registrato.", 409);
        const id = crypto.randomUUID();
        await tx
          .prepare(
            "INSERT INTO owner_payments(id,booking_id,kind,amount,method,note,created,idempotency) VALUES(?,?,?,?,?,?,?,?)",
          )
          .bind(
            id,
            b.id,
            input.kind,
            input.amount,
            input.method,
            input.note || "",
            now(),
            input.idempotency,
          )
          .run();
        await tx
          .prepare("UPDATE bookings SET revision=revision+1 WHERE id=?")
          .bind(b.id)
          .run();
        await activity(
          tx,
          b.id,
          input.kind === "receipt" ? "payment_recorded" : "refund_recorded",
          { amount: input.amount, method: input.method },
        );
        const result = { ok: true, id, manual: true };
        await remember(tx, input, previous.hash, b.id, result);
        return result;
      });
      return json(response, 201);
    }
    return json({ error: "Operazione non trovata." }, 404);
  } catch (e) {
    if (e.code === "23505")
      return json(
        {
          error:
            "Le date o la richiesta sono state appena registrate. Aggiorna il calendario: nessuna modifica parziale è stata salvata.",
        },
        409,
      );
    if (e.status) return json({ error: e.message }, e.status);
    if (e instanceof SyntaxError)
      return json({ error: "Richiesta non valida." }, 400);
    console.error("CASA MIA owner operation:", e.code || "validation");
    return json(
      {
        error: e.code
          ? "Servizio dati temporaneamente non disponibile."
          : e.message || "Operazione non riuscita.",
      },
      e.code ? 503 : 400,
    );
  }
}
