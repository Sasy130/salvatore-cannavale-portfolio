import {
  bookingPushStatements,
  deliverPush,
  queueBookingPush,
  handlePushAdmin,
  disablePushEndpoint,
} from "./push.mjs";
import { mailJob, queueConfirmation, deliverEmails } from "./outbox.mjs";
import { receiptPDF } from "./receipt.mjs";
import { handleOwnerOperation, activity } from "./owner-operations.mjs";
import { defaults, quoteBooking, nightsBetween } from "./booking.mjs";
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
const query = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
const one = async (db, sql, ...args) => (await query(db, sql, ...args))[0];
export async function settings(db) {
  return {
    ...defaults,
    ...JSON.parse(
      (await one(db, "SELECT value FROM settings WHERE id=1"))?.value || "{}",
    ),
    manualConfirmation: false,
  };
}
const digest = async (s) =>
  new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
  );
const sessionKey = async (token) =>
  [...(await digest(token))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
const same = async (a, b) => {
  const x = await digest(a),
    y = await digest(b);
  let n = 0;
  for (let i = 0; i < x.length; i++) n |= x[i] ^ y[i];
  return n === 0;
};
async function body(req) {
  if (+(req.headers.get("content-length") || 0) > 20000)
    throw Error("Richiesta troppo grande.");
  const txt = await req.text();
  if (txt.length > 20000) throw Error("Richiesta troppo grande.");
  return JSON.parse(txt);
}
async function expire(db) {
  await db.batch([
    db
      .prepare(
        "DELETE FROM nights WHERE booking_id IN (SELECT id FROM bookings WHERE status='awaiting_payment' AND expires < ?)",
      )
      .bind(Date.now()),
    db
      .prepare(
        "UPDATE bookings SET status='expired' WHERE status='awaiting_payment' AND expires < ?",
      )
      .bind(Date.now()),
  ]);
}
const mail = queueConfirmation;
async function stripe(env, path, data, idempotency) {
  if (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))
    throw Error(
      "Stripe test non è configurato. Scegli pagamento in struttura.",
    );
  const r = await (env.FETCH || fetch)("https://api.stripe.com/v1/" + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
    },
    body: new URLSearchParams(data),
    signal: AbortSignal.timeout(10000),
  });
  const b = await r.json();
  if (!r.ok)
    throw Error(
      "Stripe test non disponibile. Riprova o scegli pagamento in struttura.",
    );
  return b;
}
async function verifyWebhook(req, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw Error("Webhook non configurato.");
  const signature = req.headers.get("stripe-signature") || "",
    t = signature.match(/(?:^|,)t=(\d+)/)?.[1],
    sigs = [...signature.matchAll(/(?:^|,)v1=([a-f0-9]+)/g)].map((x) => x[1]);
  if (!t || Math.abs(Date.now() / 1000 - +t) > 300)
    throw Error("Firma webhook scaduta.");
  const raw = await req.text();
  if (raw.length > 256000) throw Error("Evento troppo grande.");
  const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    ),
    mac = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${t}.${raw}`),
      ),
    ),
    hex = [...mac].map((n) => n.toString(16).padStart(2, "0")).join("");
  let valid = false;
  for (const sig of sigs) if (await same(sig, hex)) valid = true;
  if (!valid) throw Error("Firma webhook non valida.");
  return JSON.parse(raw);
}
async function closeCheckout(env, id) {
  if (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))
    throw Error("Stripe test non configurato.");
  const response = await (env.FETCH || fetch)(
    "https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(id),
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
  );
  if (!response.ok) throw Error("Impossibile verificare la sessione.");
  const session = await response.json();
  if (session.status === "expired") return session;
  if (session.status !== "open")
    throw Error("Sessione già completata: verifica il pagamento.");
  return stripe(env, `checkout/sessions/${encodeURIComponent(id)}/expire`, {});
}
async function openCheckout(env, b, origin) {
  let session;
  if (b.stripe_session) {
    const r = await (env.FETCH || fetch)(
      "https://api.stripe.com/v1/checkout/sessions/" +
        encodeURIComponent(b.stripe_session),
      {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!r.ok)
      throw Error("Impossibile verificare la sessione Stripe. Riprova.");
    session = await r.json();
  } else {
    session = await stripe(
      env,
      "checkout/sessions",
      {
        mode: "payment",
        success_url: origin + "/demos/dimora-mia/?payment=return#booking",
        cancel_url: origin + "/demos/dimora-mia/?payment=cancelled#booking",
        customer_email: b.email,
        client_reference_id: b.id,
        "metadata[booking_id]": b.id,
        "payment_intent_data[metadata][booking_id]": b.id,
        "payment_method_types[0]": "card",
        "payment_method_options[card][request_three_d_secure]": "automatic",
        expires_at: String(
          Math.floor(new Date(b.created).getTime() / 1000) + 1800,
        ),
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][unit_amount]": String(b.due),
        "line_items[0][price_data][product_data][name]": `DIMORA MIA - ${b.payment === "deposit" ? "Acconto" : "Soggiorno"} DEMO`,
        "line_items[0][quantity]": "1",
      },
      "casa-mia-checkout-" + b.id,
    );
  }
  let target;
  try {
    target = new URL(session.url);
  } catch {}
  if (
    !session.id?.startsWith("cs_test_") ||
    session.status !== "open" ||
    target?.protocol !== "https:" ||
    target.hostname !== "checkout.stripe.com"
  )
    throw Error(
      "Sessione non disponibile: attendi la verifica o contatta il proprietario.",
    );
  const saved = await env.DB.prepare(
    "UPDATE bookings SET stripe_session=? WHERE id=? AND status='awaiting_payment' RETURNING id",
  )
    .bind(session.id, b.id)
    .all();
  if (!saved.results.length) {
    await closeCheckout(env, session.id);
    throw Error("La prenotazione non è più attiva.");
  }
  return {
    id: b.id,
    url: session.url,
    status: "awaiting_payment",
    total: b.total,
  };
}
export async function handleAPI(req, env) {
  const url = new URL(req.url),
    p = url.pathname.replace("/api/casa-mia/", ""),
    db = env.DB;
  if (!db)
    return json(
      { error: "Database non configurato. Prenotazioni non disponibili." },
      503,
    );
  try {
    if (p === "jobs/push") {
      const token = req.headers.get("authorization") || "";
      if (
        !env.PUSH_JOB_SECRET ||
        env.PUSH_JOB_SECRET.length < 32 ||
        !(await same(token, "Bearer " + env.PUSH_JOB_SECRET))
      )
        return json({ error: "Accesso non consentito." }, 401);
      if (!["GET", "POST"].includes(req.method))
        return json({ error: "Metodo non consentito." }, 405);
      return json(await deliverPush(env, { limit: 3 }));
    }
    if (p === "jobs/email") {
      const token = req.headers.get("authorization") || "";
      if (
        !env.MAIL_JOB_SECRET ||
        env.MAIL_JOB_SECRET.length < 32 ||
        !(await same(token, "Bearer " + env.MAIL_JOB_SECRET))
      )
        return json({ error: "Accesso non consentito." }, 401);
      if (!["POST", "GET"].includes(req.method))
        return json({ error: "Metodo non consentito." }, 405);
      return json(await deliverEmails(env, { limit: 3 }));
    }
    if (req.method !== "GET" && p !== "stripe/webhook") {
      const origin = req.headers.get("origin");
      if (!origin || origin !== url.origin)
        return json({ error: "Origine richiesta non consentita." }, 403);
    }
    if (p === "stripe/webhook" && req.method === "POST") {
      const event = await verifyWebhook(req, env),
        session = event.data?.object;
      let bookingId = null;
      if (
        [
          "checkout.session.completed",
          "checkout.session.async_payment_succeeded",
        ].includes(event.type) &&
        session
      ) {
        bookingId = await db.transaction(async (tx) => {
          const b = await one(
            tx,
            "SELECT * FROM bookings WHERE id=? FOR UPDATE",
            session.metadata?.booking_id || "",
          );
          if (
            !b ||
            !["full", "deposit"].includes(b.payment) ||
            b.stripe_session !== session.id ||
            session.payment_status !== "paid" ||
            session.currency !== "eur" ||
            session.amount_total !== b.due ||
            session.livemode !== false
          )
            return null;
          const prior = await one(
            tx,
            "SELECT id FROM payment_receipts WHERE stripe_session=?",
            session.id,
          );
          if (prior) return b.id;
          const held = await query(
              tx,
              "SELECT date FROM nights WHERE booking_id=?",
              b.id,
            ),
            dates = nightsBetween(b.checkin, b.checkout);
          const confirmed =
            b.status === "confirmed" ||
            (b.status === "awaiting_payment" &&
              Number(b.expires) > Date.now() &&
              dates.every((d) => held.some((n) => n.date === d)));
          const status = confirmed ? "confirmed" : "payment_review_required",
            issued = new Date().toISOString();
          await tx
            .prepare(
              "UPDATE bookings SET status=?,expires=NULL,revision=revision+1 WHERE id=?",
            )
            .bind(status, b.id)
            .run();
          const snapshot = { ...b, status };
          const receipt = {
            id: "CM-R-" + crypto.randomUUID().slice(0, 12).toUpperCase(),
            booking_id: b.id,
            stripe_session: session.id,
            payment_intent:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            amount: b.due,
            currency: "eur",
            mode: "test",
            issued,
            snapshot: JSON.stringify(snapshot),
          };
          await tx
            .prepare(
              "INSERT INTO payment_receipts(id,booking_id,stripe_session,payment_intent,amount,currency,mode,issued,snapshot) VALUES(?,?,?,?,?,?,?,?,?)",
            )
            .bind(
              receipt.id,
              b.id,
              receipt.stripe_session,
              receipt.payment_intent,
              receipt.amount,
              "eur",
              "test",
              issued,
              receipt.snapshot,
            )
            .run();
          await mailJob(tx, snapshot, "receipt", receipt).run();
          for (const statement of bookingPushStatements(tx, env, snapshot))
            await statement.run();
          await activity(tx, b.id, "payment_verified", {
            receiptId: receipt.id,
            amount: b.due,
            mode: "test",
            review: !confirmed,
          });
          return b.id;
        });
      }
      if (bookingId) {
        await deliverEmails(env, { bookingId, limit: 1 });
        await queueBookingPush(env, bookingId);
      }
      return json({ received: true });
    }
    if (p === "availability" && req.method === "GET") {
      await expire(db);
      const s = await settings(db),
        month = url.searchParams.get("month");
      if (!/^\d{4}-\d{2}$/.test(month || "")) throw Error("Mese non valido.");
      const locked = await query(
        db,
        "SELECT date FROM nights WHERE date LIKE ?",
        month + "%",
      );
      return json({
        blocked: [
          ...locked.map((x) => x.date),
          ...s.blockedDates.filter((x) => x.startsWith(month)),
        ],
        config: {
          ...s,
          stripeReady: !!env.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
          fullOnline:
            s.fullOnline && !!env.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
          depositOnline:
            s.depositOnline && !!env.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
        },
      });
    }
    if (p === "quote" && req.method === "POST") {
      await expire(db);
      const q = quoteBooking(await body(req), await settings(db));
      const locked = await query(
        db,
        "SELECT date FROM nights WHERE date >= ? AND date < ?",
        q.dates[0],
        new Date(new Date(q.dates.at(-1) + "T00:00:00Z").getTime() + 86400000)
          .toISOString()
          .slice(0, 10),
      );
      if (locked.length)
        return json(
          { error: "Queste date sono già occupate. Prova un altro periodo." },
          409,
        );
      return json(q);
    }
    if (p === "book" && req.method === "POST") {
      await expire(db);
      const input = await body(req);
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotency || ""))
        throw Error("Riferimento richiesta non valido.");
      const previous = await one(
        db,
        "SELECT * FROM bookings WHERE idempotency=?",
        input.idempotency,
      );
      if (previous) {
        if (
          previous.checkin !== input.checkin ||
          previous.checkout !== input.checkout ||
          previous.guests !== input.guests ||
          previous.email !== input.email ||
          previous.payment !== input.payment
        )
          return json(
            {
              error:
                "Questa richiesta è già associata ad altri dati. Torna alle date e riprova.",
            },
            409,
          );
        if (
          !["awaiting_payment", "confirmed", "pending"].includes(
            previous.status,
          )
        )
          return json(
            {
              error:
                "Questa prenotazione non è più attiva. Verifica nuovamente le date e avvia una nuova richiesta.",
            },
            409,
          );
        if (previous.status === "awaiting_payment")
          return json(await openCheckout(env, previous, url.origin));
        const delivery = await one(
          db,
          "SELECT status FROM email_outbox WHERE booking_id=? AND kind='confirmation'",
          previous.id,
        );
        return json({
          emailQueued: !!delivery && delivery.status !== "sent",
          id: previous.id,
          status: previous.status,
          total: previous.total,
          emailSent: delivery?.status === "sent",
        });
      }
      const s = await settings(db),
        q = quoteBooking(input, s);
      if (input.expectedTotal !== undefined && input.expectedTotal !== q.total)
        return json(
          {
            error:
              "La tariffa è stata aggiornata. Torna alle date e verifica nuovamente il prezzo.",
          },
          409,
        );
      if (
        typeof input.name !== "string" ||
        input.name.trim().length < 2 ||
        input.name.length > 100 ||
        !/^\S+@\S+\.\S+$/.test(input.email || "") ||
        input.email.length > 150
      )
        throw Error("Inserisci nome ed email validi.");
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotency || ""))
        throw Error("Riferimento richiesta non valido.");
      if (
        !["arrival", "full", "deposit"].includes(input.payment) ||
        !{
          arrival: s.payOnArrival,
          full: s.fullOnline,
          deposit: s.depositOnline,
        }[input.payment]
      )
        throw Error("Modalità di pagamento non disponibile.");
      const online = input.payment !== "arrival";
      if (
        online &&
        (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ||
          !env.STRIPE_WEBHOOK_SECRET)
      )
        throw Error(
          "Configura Stripe test e webhook prima di utilizzare i pagamenti online.",
        );
      const prior = await one(
        db,
        "SELECT * FROM bookings WHERE idempotency=?",
        input.idempotency,
      );
      if (prior)
        return json({
          id: prior.id,
          status: prior.status,
          total: prior.total,
          emailSent: false,
        });
      const ip = (
        req.headers.get("x-vercel-forwarded-for") ||
        req.headers.get("x-forwarded-for") ||
        "local"
      )
        .split(",")[0]
        .trim();
      const limit = await db
        .prepare(
          "INSERT INTO attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.expires < ? THEN 1 ELSE attempts.count+1 END,expires=CASE WHEN attempts.expires < ? THEN excluded.expires ELSE attempts.expires END RETURNING count",
        )
        .bind("book:" + ip, Date.now() + 3600000, Date.now(), Date.now())
        .all();
      if (limit.results[0].count > 5)
        return json(
          {
            error:
              "Troppe richieste di prenotazione. Riprova più tardi o contatta il proprietario.",
          },
          429,
        );
      const b = {
        ...input,
        id: "CM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
        total: q.total,
        due:
          input.payment === "deposit"
            ? Math.round((q.total * s.depositPercent) / 100)
            : q.total,
        status: online ? "awaiting_payment" : "confirmed",
        created: new Date().toISOString(),
        expires: online ? Date.now() + 3600000 : null,
      };
      try {
        await db.batch([
          db
            .prepare(
              "INSERT INTO bookings (id,checkin,checkout,guests,name,email,total,due,payment,status,created,expires,idempotency) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            )
            .bind(
              b.id,
              b.checkin,
              b.checkout,
              b.guests,
              b.name.trim(),
              b.email,
              b.total,
              b.due,
              b.payment,
              b.status,
              b.created,
              b.expires,
              b.idempotency,
            ),
          ...q.dates.map((d) =>
            db
              .prepare("INSERT INTO nights (date,booking_id) VALUES (?,?)")
              .bind(d, b.id),
          ),
          ...(!online
            ? [mailJob(db, b), ...bookingPushStatements(db, env, b)]
            : []),
        ]);
      } catch {
        return json(
          {
            error:
              "Le date sono state appena prenotate. Scegli un altro periodo.",
          },
          409,
        );
      }
      if (online) return json(await openCheckout(env, b, url.origin));
      const emailSent = await mail(env, b);
      await queueBookingPush(env, b.id);
      return json(
        {
          id: b.id,
          status: b.status,
          total: b.total,
          emailSent,
          emailQueued: !emailSent,
        },
        201,
      );
    }
    if (p === "admin/login" && req.method === "POST") {
      if (!env.ADMIN_PASSWORD)
        return json({ error: "Accesso amministratore da configurare." }, 503);
      const key = (
          req.headers.get("x-vercel-forwarded-for") ||
          req.headers.get("x-forwarded-for") ||
          "local"
        )
          .split(",")[0]
          .trim(),
        attempt = await one(db, "SELECT * FROM attempts WHERE key=?", key);
      if (attempt && attempt.expires > Date.now() && attempt.count >= 8)
        return json({ error: "Troppi tentativi. Riprova tra 15 minuti." }, 429);
      const input = await body(req);
      if (!(await same(String(input.password || ""), env.ADMIN_PASSWORD))) {
        await db
          .prepare(
            "INSERT INTO attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.expires < ? THEN 1 ELSE attempts.count+1 END,expires=?",
          )
          .bind(key, Date.now() + 900000, Date.now(), Date.now() + 900000)
          .run();
        return json({ error: "Password non corretta." }, 401);
      }
      await db.prepare("DELETE FROM attempts WHERE key=?").bind(key).run();
      const token = crypto.randomUUID() + crypto.randomUUID();
      await db
        .prepare("INSERT INTO sessions (token,expires) VALUES (?,?)")
        .bind(await sessionKey(token), Date.now() + 28800000)
        .run();
      return json({ ok: true }, 200, {
        "Set-Cookie": `casa_mia_owner=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${url.protocol === "https:" ? "; Secure" : ""}`,
      });
    }
    if (p.startsWith("admin/")) {
      const token = req.headers
          .get("cookie")
          ?.match(/(?:^|;\s*)casa_mia_owner=([^;]+)/)?.[1],
        session =
          token &&
          (await one(
            db,
            "SELECT * FROM sessions WHERE token=? AND expires>?",
            await sessionKey(token),
            Date.now(),
          ));
      if (!session)
        return json({ error: "Accedi al pannello proprietario." }, 401);
      if (p === "admin/push" || p.startsWith("admin/push/"))
        return handlePushAdmin(p, req, env);
      if (p.startsWith("admin/receipts/") && req.method === "GET") {
        const receipt = await one(
          db,
          "SELECT * FROM payment_receipts WHERE id=?",
          p.slice("admin/receipts/".length),
        );
        if (!receipt) return json({ error: "Ricevuta non trovata." }, 404);
        return new Response(receiptPDF(receipt), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="CASA-MIA-${receipt.id}.pdf"`,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      if (p === "admin/emails/retry" && req.method === "POST") {
        const input = await body(req),
          job = await one(
            db,
            "SELECT * FROM email_outbox WHERE id=?",
            input.id || "",
          );
        if (!job) return json({ error: "Invio non trovato." }, 404);
        if (
          job.status !== "queued" ||
          job.attempts >= 8 ||
          (job.first_attempt &&
            Date.now() - Number(job.first_attempt) > 23 * 3600000)
        )
          return json(
            {
              error:
                "Verifica prima l’esito con il servizio email: questo invio non può essere ripetuto automaticamente.",
            },
            409,
          );
        if (!env.RESEND_API_KEY || !env.MAIL_FROM)
          return json(
            { error: "Configura il servizio email prima di riprovare." },
            409,
          );
        await db
          .prepare(
            "UPDATE email_outbox SET next_attempt=0 WHERE id=? AND status='queued'",
          )
          .bind(job.id)
          .run();
        return json(await deliverEmails(env, { jobId: job.id, limit: 1 }));
      }
      if (
        [
          "admin/console",
          "admin/preview",
          "admin/reservations",
          "admin/payments",
          "admin/actions",
          "admin/operations",
        ].includes(p)
      ) {
        await expire(db);
        return handleOwnerOperation(p, req, {
          ...env,
          sendMail: (b) => mail(env, b),
          expireCheckout: (id) => closeCheckout(env, id),
        });
      }
      if (p === "admin/logout" && req.method === "POST") {
        const input = await body(req);
        await disablePushEndpoint(db, input.pushEndpoint);
        await db
          .prepare("DELETE FROM sessions WHERE token=?")
          .bind(await sessionKey(token))
          .run();
        return json({ ok: true }, 200, {
          "Set-Cookie":
            "casa_mia_owner=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
        });
      }
      if (p === "admin/data" && req.method === "GET") {
        await expire(db);
        return json({
          bookings: await query(
            db,
            "SELECT * FROM bookings ORDER BY created DESC LIMIT 500",
          ),
          settings: await settings(db),
          stripeReady:
            !!env.STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
            !!env.STRIPE_WEBHOOK_SECRET,
          emailReady: !!env.RESEND_API_KEY && !!env.MAIL_FROM,
        });
      }
      if (p === "admin/manual" && req.method === "POST") {
        const input = await body(req),
          blocking = input.kind === "block";
        if (
          typeof input.name !== "string" ||
          input.name.trim().length < 2 ||
          input.name.length > 100
        )
          throw Error("Inserisci un nome o un motivo per il blocco.");
        if (
          input.email &&
          (!/^\S+@\S+\.\S+$/.test(input.email) || input.email.length > 150)
        )
          throw Error("Email non valida.");
        if (!/^[a-zA-Z0-9-]{16,80}$/.test(input.idempotency || ""))
          throw Error("Riferimento richiesta non valido.");
        const prior = await one(
          db,
          "SELECT * FROM bookings WHERE idempotency=?",
          input.idempotency,
        );
        if (prior) {
          if (
            prior.checkin !== input.checkin ||
            prior.checkout !== input.checkout ||
            prior.name !== input.name.trim() ||
            (prior.payment === "block") !== blocking ||
            prior.email !== (input.email || "") ||
            prior.phone !== (input.phone || "") ||
            prior.notes !== (input.notes || "") ||
            (!blocking && prior.guests !== input.guests) ||
            (input.amount !== undefined && prior.total !== input.amount)
          )
            return json(
              {
                error:
                  "Questo inserimento è già associato ad altri dati. Aggiorna il calendario.",
              },
              409,
            );
          return json({ ok: true, id: prior.id });
        }
        const dates = nightsBetween(input.checkin, input.checkout);
        if (input.checkin < new Date().toISOString().slice(0, 10))
          throw Error("Scegli date da oggi in poi.");
        if (
          typeof (input.phone || "") !== "string" ||
          (input.phone || "").length > 50 ||
          typeof (input.notes || "") !== "string" ||
          (input.notes || "").length > 1000
        )
          throw Error("Contatti o note troppo lunghi.");
        const source = ["direct", "phone", "airbnb", "booking"].includes(
          input.source,
        )
          ? input.source
          : "phone";
        const s = await settings(db),
          q = blocking ? { total: 0 } : quoteBooking(input, s);
        if (!blocking && input.amount !== undefined) {
          if (
            !Number.isInteger(input.amount) ||
            input.amount < 0 ||
            input.amount > 10000000
          )
            throw Error("Importo non valido.");
          q.total = input.amount;
        }
        const id = "CM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
          status = blocking ? "blocked" : "confirmed";
        if (blocking && dates.some((d) => s.blockedDates.includes(d)))
          throw Error("Date già bloccate nelle regole.");
        try {
          await db.batch([
            db
              .prepare(
                "INSERT INTO bookings (id,checkin,checkout,guests,name,email,total,due,payment,status,created,expires,idempotency,phone,notes,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              )
              .bind(
                id,
                input.checkin,
                input.checkout,
                blocking ? 1 : input.guests,
                input.name.trim(),
                input.email || "",
                q.total,
                q.total,
                blocking ? "block" : "arrival",
                status,
                new Date().toISOString(),
                null,
                input.idempotency,
                input.phone || "",
                input.notes || "",
                source,
              ),
            ...dates.map((d) =>
              db
                .prepare("INSERT INTO nights (date,booking_id) VALUES (?,?)")
                .bind(d, id),
            ),
          ]);
        } catch {
          return json(
            {
              error:
                "Una delle notti è già occupata. Nessuna modifica è stata salvata.",
            },
            409,
          );
        }
        return json(
          { ok: true, id, status, total: q.total, emailSent: false },
          201,
        );
      }
      if (p === "admin/settings" && req.method === "POST") {
        const input = await body(req),
          s = await settings(db);
        for (const [k, min, max] of [
          ["baseRate", 1000, 1000000],
          ["summerRate", 1000, 1000000],
          ["cleaning", 0, 100000],
          ["minStay", 1, 30],
          ["summerMinStay", 1, 30],
          ["depositPercent", 1, 99],
        ]) {
          if (!Number.isInteger(input[k]) || input[k] < min || input[k] > max)
            throw Error("Valore non valido: " + k);
          s[k] = input[k];
        }
        for (const k of ["payOnArrival", "fullOnline", "depositOnline"])
          s[k] = !!input[k];
        s.manualConfirmation = false;
        if (!s.payOnArrival && !s.fullOnline && !s.depositOnline)
          throw Error("Abilita almeno una modalità di pagamento.");
        if (
          (s.fullOnline || s.depositOnline) &&
          (!env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ||
            !env.STRIPE_WEBHOOK_SECRET)
        )
          throw Error(
            "Configura una chiave Stripe test e il webhook prima di abilitare pagamenti online.",
          );
        if (
          !Array.isArray(input.blockedDates) ||
          input.blockedDates.length > 730 ||
          input.blockedDates.some((x) => !/^\d{4}-\d{2}-\d{2}$/.test(x))
        )
          throw Error("Date bloccate non valide.");
        s.blockedDates = [...new Set(input.blockedDates)];
        for (const key of ["living", "bedroom", "terrace"]) {
          const v = input.assets?.[key];
          if (
            typeof v !== "string" ||
            v.length > 2000 ||
            !(
              v.startsWith("/demos/dimora-mia/assets/") ||
              v.startsWith("https://")
            )
          )
            throw Error("Usa un URL HTTPS o un asset locale.");
          s.assets[key] = v;
        }
        await db
          .prepare(
            "INSERT INTO settings (id,value) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value",
          )
          .bind(JSON.stringify(s))
          .run();
        return json({ ok: true });
      }
      if (p === "admin/booking" && req.method === "POST") {
        const { id, action } = await body(req),
          b = await one(db, "SELECT * FROM bookings WHERE id=?", id);
        if (!b) throw Error("Prenotazione non trovata.");
        if (action === "confirm" && b.status === "pending") {
          const changed = await db
            .prepare(
              "UPDATE bookings SET status='confirmed',revision=revision+1 WHERE id=? AND status='pending' RETURNING id",
            )
            .bind(id)
            .all();
          if (!changed.results.length)
            return json(
              { error: "Lo stato è cambiato. Aggiorna il calendario." },
              409,
            );
          await activity(db, id, "reservation_confirmed");
          const emailSent = await mail(env, { ...b, status: "confirmed" });
          return json({ ok: true, emailSent });
        }
        if (
          action === "cancel" &&
          [
            "pending",
            "confirmed",
            "blocked",
            "awaiting_payment",
            "payment_review_required",
          ].includes(b.status)
        ) {
          if (b.stripe_session && b.status === "awaiting_payment") {
            try {
              await stripe(
                env,
                `checkout/sessions/${b.stripe_session}/expire`,
                {},
              );
            } catch {
              throw Error(
                "Impossibile annullare la sessione Stripe. Verifica Stripe prima di liberare le date.",
              );
            }
          }
          await db.batch([
            db.prepare("DELETE FROM nights WHERE booking_id=?").bind(id),
            db
              .prepare(
                "UPDATE bookings SET status=?,expires=NULL,revision=revision+1 WHERE id=?",
              )
              .bind(
                ["full", "deposit"].includes(b.payment) &&
                  ["confirmed", "payment_review_required"].includes(b.status)
                  ? "cancelled_refund_required"
                  : "cancelled",
                id,
              ),
          ]);
          await activity(db, id, "reservation_cancelled");
          return json({ ok: true });
        }
        throw Error("Azione non consentita per questo stato.");
      }
      return json({ error: "Operazione non trovata." }, 404);
    }
    return json({ error: "Operazione non trovata." }, 404);
  } catch (e) {
    console.error("DIMORA MIA API error:", e.code || "validation");
    return json(
      {
        error:
          e.code ||
          e.message?.startsWith("D1_") ||
          e.message?.includes("SQLITE")
            ? "Servizio dati temporaneamente non disponibile."
            : e.message || "Richiesta non valida.",
      },
      400,
    );
  }
}
