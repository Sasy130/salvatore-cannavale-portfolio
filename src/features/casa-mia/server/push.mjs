import { nativeBookingStatements, deliverNativePush } from "./native-push.mjs";
import webpush from "web-push";
import { createHash, ECDH } from "node:crypto";
const all = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
const hash = (v) => createHash("sha256").update(v).digest("hex");
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
export function pushConfig(env) {
  try {
    const publicKey = env.PUSH_PUBLIC_KEY,
      privateKey = env.PUSH_PRIVATE_KEY,
      subject = env.PUSH_SUBJECT;
    if (
      !/^[\w-]{87}$/.test(publicKey || "") ||
      !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subject || "")
    )
      return null;
    const pub = Buffer.from(publicKey, "base64url"),
      priv = Buffer.from(privateKey || "", "base64url");
    if (pub.length !== 65 || priv.length !== 32) return null;
    const ec = new ECDH("prime256v1");
    ec.setPrivateKey(priv);
    if (!ec.getPublicKey().equals(pub)) return null;
    return { publicKey, privateKey, subject, fingerprint: hash(publicKey) };
  } catch {
    return null;
  }
}
export function validatePushSubscription(input) {
  const s = input?.subscription;
  if (!s || typeof s.endpoint !== "string" || s.endpoint.length > 2048)
    throw Error("Iscrizione del telefono non valida.");
  const u = new URL(s.endpoint),
    hosts = {
      "fcm.googleapis.com": /^\/(fcm\/send|wp)\/.+/,
      "updates.push.services.mozilla.com": /^\/wpush\/v[12]\/.+/,
      "web.push.apple.com": /^\/.+/,
    };
  if (
    u.protocol !== "https:" ||
    u.port ||
    u.username ||
    u.password ||
    u.hash ||
    !hosts[u.hostname]?.test(u.pathname)
  )
    throw Error("Servizio push non supportato. Usa Chrome su Android.");
  const p = s.keys?.p256dh,
    a = s.keys?.auth;
  if (!/^[\w-]{87}$/.test(p || "") || !/^[\w-]{22}$/.test(a || ""))
    throw Error("Chiavi del telefono non valide.");
  const pub = Buffer.from(p, "base64url");
  if (Buffer.from(a, "base64url").length !== 16 || pub[0] !== 4)
    throw Error("Chiavi del telefono non valide.");
  ECDH.convertKey(pub, "prime256v1", undefined, undefined, "uncompressed");
  return { endpoint: u.href, p256dh: p, auth: a, endpointHash: hash(u.href) };
}
export function bookingPushStatements(db, env, b) {
  const cfg = pushConfig(env);
  if (b.status !== "confirmed") return [];
  const native = nativeBookingStatements(db, env, b);
  if (!cfg) return native;
  return [
    ...native,
    db
      .prepare(
        "INSERT INTO push_outbox(id,dedupe_key,device_id,booking_id,kind,deadline,created) SELECT 'P-'||md5(?||':'||id),'booking:'||?||':'||id,id,?,'booking',?,? FROM push_devices WHERE active=TRUE AND key_fingerprint=? ON CONFLICT(dedupe_key) DO NOTHING",
      )
      .bind(
        b.id,
        b.id,
        b.id,
        Date.now() + 3600000,
        new Date().toISOString(),
        cfg.fingerprint,
      ),
  ];
}
export async function deliverPush(
  env,
  { limit = 2, bookingId = null, jobId = null } = {},
) {
  const cfg = pushConfig(env);
  if (!cfg) return { configured: false, accepted: 0 };
  const db = env.DB,
    result = { configured: true, accepted: 0, processed: 0 };
  for (let i = 0; i < Math.min(limit, 3); i++) {
    const job = await db.transaction(async (tx) => {
      const now = Date.now(),
        j = (
          await all(
            tx,
            "SELECT * FROM push_outbox WHERE ((status='queued' AND next_attempt<=?) OR (status='sending' AND locked_until<?)) AND (?::text IS NULL OR booking_id=?) AND (?::text IS NULL OR id=?) ORDER BY created FOR UPDATE SKIP LOCKED LIMIT 1",
            now,
            now,
            bookingId,
            bookingId,
            jobId,
            jobId,
          )
        )[0];
      if (!j) return null;
      const device = (
        await all(tx, "SELECT * FROM push_devices WHERE id=?", j.device_id)
      )[0];
      let inactive =
        !device?.active || device.key_fingerprint !== cfg.fingerprint;
      if (j.kind === "booking") {
        const b = (
          await all(tx, "SELECT status FROM bookings WHERE id=?", j.booking_id)
        )[0];
        inactive ||= b?.status !== "confirmed";
      }
      if (inactive || now > Number(j.deadline) || j.attempts >= 4) {
        await tx
          .prepare(
            "UPDATE push_outbox SET status=?,locked_until=NULL WHERE id=?",
          )
          .bind(
            inactive ? "superseded" : j.attempts >= 4 ? "review" : "expired",
            j.id,
          )
          .run();
        return { skip: true };
      }
      await tx
        .prepare(
          "UPDATE push_outbox SET status='sending',attempts=attempts+1,locked_until=? WHERE id=?",
        )
        .bind(now + 60000, j.id)
        .run();
      return { ...j, device, attempts: j.attempts + 1 };
    });
    if (!job) break;
    if (job.skip) continue;
    result.processed++;
    try {
      const payload = JSON.stringify({ kind: job.kind, eventId: job.id });
      const response = await (
        env.PUSH_SEND || ((...args) => webpush.sendNotification(...args))
      )(
        {
          endpoint: job.device.endpoint,
          keys: { p256dh: job.device.p256dh, auth: job.device.auth },
        },
        payload,
        {
          vapidDetails: {
            subject: cfg.subject,
            publicKey: cfg.publicKey,
            privateKey: cfg.privateKey,
          },
          TTL: Math.max(
            1,
            Math.min(
              3600,
              Math.floor((Number(job.deadline) - Date.now()) / 1000),
            ),
          ),
          timeout: 5000,
          urgency: "normal",
        },
      );
      if (!response || response.statusCode < 200 || response.statusCode >= 300)
        throw Object.assign(Error("push rejected"), {
          statusCode: response?.statusCode,
        });
      await db
        .prepare(
          "UPDATE push_outbox SET status='accepted',accepted_at=?,locked_until=NULL,last_error=NULL WHERE id=? AND status='sending'",
        )
        .bind(new Date().toISOString(), job.id)
        .run();
      result.accepted++;
    } catch (error) {
      const status = Number(error.statusCode) || 0,
        gone = [404, 410].includes(status),
        permanent = gone || [400, 401, 403, 413].includes(status);
      await db.transaction(async (tx) => {
        if (gone)
          await tx
            .prepare("UPDATE push_devices SET active=FALSE WHERE id=?")
            .bind(job.device_id)
            .run();
        await tx
          .prepare(
            "UPDATE push_outbox SET status=?,next_attempt=?,locked_until=NULL,last_error=? WHERE id=? AND status='sending'",
          )
          .bind(
            permanent || job.attempts >= 4 ? "review" : "queued",
            Date.now() + Math.min(900000, 30000 * 2 ** (job.attempts - 1)),
            status ? "provider_http_" + status : "network_error",
            job.id,
          )
          .run();
      });
    }
  }
  return result;
}
export async function handlePushAdmin(path, req, env) {
  const db = env.DB,
    cfg = pushConfig(env);
  try {
    if (path === "admin/push" && req.method === "GET")
      return json({
        configured: !!cfg,
        publicKey: cfg?.publicKey || null,
        devices: await all(
          db,
          "SELECT id,label,active,created,last_seen,key_fingerprint=? AS key_current FROM push_devices ORDER BY created DESC",
          cfg?.fingerprint || "",
        ),
        deliveries: await all(
          db,
          "SELECT id,device_id,kind,status,attempts,created,accepted_at FROM push_outbox ORDER BY created DESC LIMIT 25",
        ),
      });
    if (req.method !== "POST")
      return json({ error: "Metodo non consentito." }, 405);
    const raw = await req.text();
    if (raw.length > 6000)
      return json({ error: "Richiesta troppo grande." }, 413);
    const input = JSON.parse(raw);
    if (path === "admin/push/diagnostic") {
      const key = "push-diag:" + hash(req.headers.get("cookie") || "");
      const now = Date.now();
      const count = (
        await all(
          db,
          "INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.expires<=? THEN 1 ELSE attempts.count+1 END,expires=CASE WHEN attempts.expires<=? THEN EXCLUDED.expires ELSE attempts.expires END RETURNING count",
          key,
          now + 60000,
          now,
          now,
        )
      )[0];
      if (Number(count.count) > 20)
        return json({ error: "Attendi un minuto prima di riprovare." }, 429);
      const pick = (value, allowed) =>
        allowed.includes(value) ? value : "unknown";
      const diagnostic = {
        event: pick(input.event, [
          "opened",
          "consent",
          "worker",
          "subscription-read",
          "subscribe",
          "server",
          "connected",
          "failed",
        ]),
        phase: pick(input.phase, [
          "opened",
          "consent",
          "worker",
          "subscription-read",
          "subscribe",
          "server",
          "connected",
        ]),
        permission: pick(input.permission, [
          "granted",
          "denied",
          "default",
          "unsupported",
        ]),
        browser: pick(input.browser, [
          "chrome",
          "samsung",
          "webview",
          "edge",
          "other",
        ]),
        error: pick(input.error, [
          "Error",
          "AbortError",
          "NotAllowedError",
          "InvalidStateError",
          "NotSupportedError",
          "NetworkError",
          "TimeoutError",
          "TypeError",
          "none",
        ]),
        standalone: input.standalone === true,
        online: input.online === true,
        userActivation: input.userActivation === true,
      };
      console.info("DIMORA_MIA_PUSH_DIAG " + JSON.stringify(diagnostic));
      return json({ ok: true });
    }
    if (path === "admin/push/disable") {
      await db.transaction(async (tx) => {
        await tx
          .prepare("UPDATE push_devices SET active=FALSE WHERE id=?")
          .bind(input.id || "")
          .run();
        await tx
          .prepare(
            "UPDATE push_outbox SET status='superseded',locked_until=NULL WHERE device_id=? AND status='queued'",
          )
          .bind(input.id || "")
          .run();
      });
      return json({ ok: true });
    }
    if (!cfg)
      return json(
        { error: "Il servizio push deve essere configurato sul server." },
        409,
      );
    if (path === "admin/push/subscribe") {
      const sub = validatePushSubscription(input),
        label =
          typeof input.label === "string"
            ? input.label.trim().slice(0, 60)
            : "Telefono proprietario";
      const id = await db.transaction(async (tx) => {
        await all(
          tx,
          "SELECT version FROM schema_migrations WHERE version=5 FOR UPDATE",
        );
        const prior = (
          await all(
            tx,
            "SELECT id,active FROM push_devices WHERE endpoint_hash=?",
            sub.endpointHash,
          )
        )[0];
        const count = Number(
          (
            await all(
              tx,
              "SELECT count(*) AS n FROM push_devices WHERE active=TRUE",
            )
          )[0].n,
        );
        if (!prior?.active && count >= 10)
          throw Error(
            "Sono già collegati 10 dispositivi. Disattivane uno prima di continuare.",
          );
        const id = prior?.id || crypto.randomUUID(),
          date = new Date().toISOString();
        await tx
          .prepare(
            "INSERT INTO push_devices(id,endpoint_hash,endpoint,p256dh,auth,key_fingerprint,label,created,last_seen) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(endpoint_hash) DO UPDATE SET p256dh=EXCLUDED.p256dh,auth=EXCLUDED.auth,key_fingerprint=EXCLUDED.key_fingerprint,label=EXCLUDED.label,last_seen=EXCLUDED.last_seen,active=TRUE",
          )
          .bind(
            id,
            sub.endpointHash,
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            cfg.fingerprint,
            label || "Telefono proprietario",
            date,
            date,
          )
          .run();
        return id;
      });
      return json({ ok: true, id }, 201);
    }
    if (path === "admin/push/test") {
      const job = await db.transaction(async (tx) => {
        const d = (
          await all(
            tx,
            "SELECT id FROM push_devices WHERE id=? AND active=TRUE AND key_fingerprint=? FOR UPDATE",
            input.id || "",
            cfg.fingerprint,
          )
        )[0];
        if (!d) throw Error("Collega prima questo dispositivo.");
        const last = (
          await all(
            tx,
            "SELECT created FROM push_outbox WHERE device_id=? AND kind='test' ORDER BY created DESC LIMIT 1",
            d.id,
          )
        )[0];
        if (last && Date.now() - new Date(last.created).getTime() < 60000)
          throw Error("Attendi un minuto prima di ripetere la prova.");
        const id = crypto.randomUUID();
        await tx
          .prepare(
            "INSERT INTO push_outbox(id,dedupe_key,device_id,kind,deadline,created) VALUES(?,?,?,'test',?,?)",
          )
          .bind(
            id,
            "test:" + id,
            d.id,
            Date.now() + 300000,
            new Date().toISOString(),
          )
          .run();
        return id;
      });
      return json(await deliverPush(env, { jobId: job, limit: 1 }));
    }
    return json({ error: "Operazione non trovata." }, 404);
  } catch (error) {
    if (error.code)
      return json(
        { error: "Servizio push temporaneamente non disponibile." },
        503,
      );
    return json(
      {
        error:
          error instanceof SyntaxError
            ? "Richiesta non valida."
            : error.message || "Operazione non riuscita.",
      },
      400,
    );
  }
}
export async function disablePushEndpoint(db, endpoint) {
  if (typeof endpoint === "string" && endpoint.length <= 2048)
    await db
      .prepare("UPDATE push_devices SET active=FALSE WHERE endpoint_hash=?")
      .bind(hash(endpoint))
      .run();
}

// Four bounded workers drain the ten supported phones without delaying checkout.
// The durable outbox remains authoritative if a provider fails or execution stops.
export async function queueBookingPush(env, bookingId) {
  const work = async () => {
    const results = await Promise.allSettled([
      ...Array.from({ length: 4 }, () =>
        deliverPush(env, { bookingId, limit: 3 }),
      ),
      ...Array.from({ length: 4 }, () =>
        deliverNativePush(env, { bookingId, limit: 3 }),
      ),
    ]);
    if (results.some((r) => r.status === "rejected"))
      console.error("DIMORA MIA push: invio da riprendere dalla coda");
  };
  if (typeof env.BACKGROUND === "function") env.BACKGROUND(work);
  else await work();
}
