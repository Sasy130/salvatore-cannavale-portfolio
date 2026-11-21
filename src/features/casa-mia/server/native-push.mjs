import { createHash, createPrivateKey, sign } from "node:crypto";
const all = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
const hash = (s) => createHash("sha256").update(s).digest("hex");
const cache = new Map();
export function nativeConfig(env) {
  try {
    const raw = JSON.parse(env.FIREBASE_ANDROID_CONFIG || "null"),
      android = raw?.client?.find(c => c.client_info?.android_client_info?.package_name === "it.dimoramia.owner"),
      client = raw?.project_info ? {
        projectId: raw.project_info.project_id,
        senderId: raw.project_info.project_number,
        applicationId: android?.client_info?.mobilesdk_app_id,
        apiKey: android?.api_key?.[0]?.current_key,
      } : raw,
      service = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || "null");
    if (
      !client ||
      !service ||
      !/^([a-z][a-z0-9-]{4,28}[a-z0-9])$/.test(client.projectId || "") ||
      service.project_id !== client.projectId ||
      !/^1:\d+:android:[a-f0-9]+$/.test(client.applicationId || "") ||
      !/^\d+$/.test(client.senderId || "") ||
      !client.applicationId.startsWith("1:" + client.senderId + ":android:") ||
      !/^AIza[\w-]{30,60}$/.test(client.apiKey || "") ||
      !/^.+@.+\.iam\.gserviceaccount\.com$/.test(service.client_email || "") ||
      !String(service.private_key || "").includes("BEGIN PRIVATE KEY")
    )
      return null;
    const key = createPrivateKey(service.private_key);
    if (key.asymmetricKeyType !== "rsa") return null;
    return {
      client: {
        projectId: client.projectId,
        applicationId: client.applicationId,
        senderId: client.senderId,
        apiKey: client.apiKey,
      },
      service,
      key,
    };
  } catch {
    return null;
  }
}
export function nativeBookingStatements(db, env, b) {
  const cfg = nativeConfig(env);
  if (!cfg || b.status !== "confirmed") return [];
  return [
    db
      .prepare(
        "INSERT INTO native_push_outbox(id,dedupe_key,device_id,booking_id,kind,deadline,created) SELECT 'N-'||md5(?||':'||id),'booking:'||?||':'||id,id,?,'booking',?,? FROM native_devices WHERE active=TRUE AND project_id=? ON CONFLICT(dedupe_key) DO NOTHING",
      )
      .bind(
        b.id,
        b.id,
        b.id,
        Date.now() + 3600000,
        new Date().toISOString(),
        cfg.client.projectId,
      ),
  ];
}
async function accessToken(cfg) {
  const id = hash(cfg.service.private_key);
  const prior = cache.get(id);
  if (prior && prior.until > Date.now()) return prior.token;
  const now = Math.floor(Date.now() / 1000);
  const encode = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned =
    encode({ alg: "RS256", typ: "JWT" }) +
    "." +
    encode({
      iss: cfg.service.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const assertion =
    unsigned +
    "." +
    sign("RSA-SHA256", Buffer.from(unsigned), cfg.key).toString("base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(6000),
  });
  const data = await response.json();
  if (!response.ok || typeof data.access_token !== "string")
    throw Error("firebase_credentials");
  cache.set(id, {
    token: data.access_token,
    until: Date.now() + Math.min(3300, Number(data.expires_in) || 3000) * 1000,
  });
  return data.access_token;
}
async function send(cfg, token, payload) {
  const bearer = await accessToken(cfg);
  const response = await fetch(
    "https://fcm.googleapis.com/v1/projects/" +
      cfg.client.projectId +
      "/messages:send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + bearer,
      },
      body: JSON.stringify({
        message: {
          token,
          data: payload,
          notification: {
            title: payload.kind === "test" ? "DIMORA MIA · prova" : "DIMORA MIA · nuova prenotazione",
            body: payload.kind === "test" ? "Il collegamento nativo con il server funziona." : "Hai ricevuto una prenotazione. Apri l’app per i dettagli.",
          },
          android: {
            priority: "HIGH",
            ttl: "3600s",
            notification: {
              channel_id: "prenotazioni",
              icon: "ic_notification",
              tag: payload.eventId,
              visibility: "PRIVATE",
              default_sound: true,
            },
          },
        },
      }),
      signal: AbortSignal.timeout(6000),
    },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const gone = data.error?.details?.some(
      (d) => d.errorCode === "UNREGISTERED",
    );
    throw Object.assign(Error("firebase_send_failed"), {
      status: response.status,
      gone,
    });
  }
  return data;
}
export async function deliverNativePush(
  env,
  { bookingId = null, jobId = null, limit = 3 } = {},
) {
  const cfg = nativeConfig(env),
    result = { configured: !!cfg, processed: 0, accepted: 0 };
  if (!cfg) return result;
  for (let i = 0; i < Math.min(limit, 3); i++) {
    const job = await env.DB.transaction(async (tx) => {
      const now = Date.now(),
        j = (
          await all(
            tx,
            "SELECT * FROM native_push_outbox WHERE ((status='queued' AND next_attempt<=?) OR (status='sending' AND locked_until<?)) AND (?::text IS NULL OR booking_id=?) AND (?::text IS NULL OR id=?) ORDER BY created FOR UPDATE SKIP LOCKED LIMIT 1",
            now,
            now,
            bookingId,
            bookingId,
            jobId,
            jobId,
          )
        )[0];
      if (!j) return null;
      const d = (
        await all(tx, "SELECT * FROM native_devices WHERE id=?", j.device_id)
      )[0];
      let invalid = !d?.active || d?.project_id !== cfg.client.projectId;
      if (j.kind === "booking") {
        const b = (
          await all(tx, "SELECT status FROM bookings WHERE id=?", j.booking_id)
        )[0];
        invalid ||= b?.status !== "confirmed";
      }
      if (invalid || now > Number(j.deadline) || j.attempts >= 4) {
        await tx
          .prepare(
            "UPDATE native_push_outbox SET status=?,locked_until=NULL WHERE id=?",
          )
          .bind(
            invalid ? "superseded" : j.attempts >= 4 ? "review" : "expired",
            j.id,
          )
          .run();
        return { skip: true };
      }
      await tx
        .prepare(
          "UPDATE native_push_outbox SET status='sending',attempts=attempts+1,locked_until=? WHERE id=?",
        )
        .bind(now + 60000, j.id)
        .run();
      return { ...j, device: d, attempts: j.attempts + 1 };
    });
    if (!job) break;
    if (job.skip) continue;
    result.processed++;
    try {
      const payload = {
        kind: job.kind,
        eventId: job.id,
        ...(job.kind === "booking" ? { bookingId: job.booking_id } : {}),
      };
      if (env.NATIVE_PUSH_SEND)
        await env.NATIVE_PUSH_SEND(job.device.token, payload);
      else await send(cfg, job.device.token, payload);
      await env.DB.prepare(
        "UPDATE native_push_outbox SET status='accepted',accepted_at=?,locked_until=NULL,last_error=NULL WHERE id=? AND status='sending'",
      )
        .bind(new Date().toISOString(), job.id)
        .run();
      result.accepted++;
    } catch (error) {
      await env.DB.transaction(async (tx) => {
        if (error.gone)
          await tx
            .prepare("UPDATE native_devices SET active=FALSE WHERE id=?")
            .bind(job.device_id)
            .run();
        await tx
          .prepare(
            "UPDATE native_push_outbox SET status=?,next_attempt=?,locked_until=NULL,last_error=? WHERE id=? AND status='sending'",
          )
          .bind(
            error.gone ||
              [400, 401, 403].includes(error.status) ||
              job.attempts >= 4
              ? "review"
              : "queued",
            Date.now() + 30000 * 2 ** (job.attempts - 1),
            error.status
              ? "firebase_http_" + error.status
              : "firebase_network_or_credentials",
            job.id,
          )
          .run();
      });
    }
  }
  return result;
}
export async function disableNativeDevice(env, id) {
  if (typeof id !== "string" || !id) return;
  await env.DB.transaction(async (tx) => {
    await tx
      .prepare("UPDATE native_devices SET active=FALSE WHERE id=?")
      .bind(id)
      .run();
    await tx
      .prepare(
        "UPDATE native_push_outbox SET status='superseded',locked_until=NULL WHERE device_id=? AND status='queued'",
      )
      .bind(id)
      .run();
  });
}
export async function handleNativePush(path, req, env) {
  const cfg = nativeConfig(env);
  try {
    if (path === "admin/native/push" && req.method === "GET")
      return json({
        configured: !!cfg,
        clientConfig: cfg?.client || null,
        devices: await all(
          env.DB,
          "SELECT id,label,active,created,last_seen FROM native_devices ORDER BY created DESC",
        ),
        deliveries: await all(
          env.DB,
          "SELECT id,device_id,kind,status,created FROM native_push_outbox ORDER BY created DESC LIMIT 25",
        ),
      });
    if (req.method !== "POST")
      return json({ error: "Metodo non consentito." }, 405);
    const raw = await req.text();
    if (raw.length > 5000)
      return json({ error: "Richiesta troppo grande." }, 413);
    const input = JSON.parse(raw);
    if (path === "admin/native/push/disable") {
      await disableNativeDevice(env, input.id);
      return json({ ok: true });
    }
    if (!cfg)
      return json(
        {
          error:
            "Le notifiche Android richiedono prima la configurazione Firebase del proprietario.",
        },
        409,
      );
    if (path === "admin/native/push/register") {
      if (
        typeof input.token !== "string" ||
        !/^[a-zA-Z0-9_:\-]{50,2000}$/.test(input.token)
      )
        return json({ error: "Token Android non valido." }, 400);
      const tokenHash = hash(input.token),
        id = await env.DB.transaction(async (tx) => {
          await all(
            tx,
            "SELECT version FROM schema_migrations WHERE version=6 FOR UPDATE",
          );
          const prior = (
            await all(
              tx,
              "SELECT id,active FROM native_devices WHERE token_hash=?",
              tokenHash,
            )
          )[0];
          if (typeof input.replaceId === "string" && input.replaceId !== prior?.id) {
            await tx.prepare("UPDATE native_devices SET active=FALSE WHERE id=? AND project_id=?")
              .bind(input.replaceId, cfg.client.projectId).run();
            await tx.prepare("UPDATE native_push_outbox SET status='superseded',locked_until=NULL WHERE device_id=? AND status='queued'")
              .bind(input.replaceId).run();
          }
          const count = Number(
            (
              await all(
                tx,
                "SELECT count(*) n FROM native_devices WHERE active=TRUE",
              )
            )[0].n,
          );
          if (!prior?.active && count >= 10)
            throw Error("Disattiva un telefono prima di aggiungerne un altro.");
          const id = prior?.id || crypto.randomUUID(),
            now = new Date().toISOString();
          await tx
            .prepare(
              "INSERT INTO native_devices(id,token_hash,token,label,project_id,created,last_seen) VALUES(?,?,?,?,?,?,?) ON CONFLICT(token_hash) DO UPDATE SET active=TRUE,label=EXCLUDED.label,project_id=EXCLUDED.project_id,last_seen=EXCLUDED.last_seen",
            )
            .bind(
              id,
              tokenHash,
              input.token,
              typeof input.label === "string"
                ? input.label.trim().slice(0, 60)
                : "Telefono Android",
              cfg.client.projectId,
              now,
              now,
            )
            .run();
          return id;
        });
      return json({ ok: true, id }, 201);
    }
    if (path === "admin/native/push/test") {
      const id = await env.DB.transaction(async (tx) => {
        const device = (
          await all(
            tx,
            "SELECT id FROM native_devices WHERE id=? AND active=TRUE AND project_id=? FOR UPDATE",
            input.id || "",
            cfg.client.projectId,
          )
        )[0];
        if (!device) throw Error("Collega prima questo telefono.");
        const last = (
          await all(
            tx,
            "SELECT created FROM native_push_outbox WHERE device_id=? AND kind='test' ORDER BY created DESC LIMIT 1",
            device.id,
          )
        )[0];
        if (last && Date.now() - new Date(last.created).getTime() < 60000)
          throw Error("Attendi un minuto prima di ripetere la prova.");
        const id = crypto.randomUUID();
        await tx
          .prepare(
            "INSERT INTO native_push_outbox(id,dedupe_key,device_id,kind,deadline,created) VALUES(?,?,?,'test',?,?)",
          )
          .bind(
            id,
            "test:" + id,
            device.id,
            Date.now() + 300000,
            new Date().toISOString(),
          )
          .run();
        return id;
      });
      return json(await deliverNativePush(env, { jobId: id, limit: 1 }));
    }
    return json({ error: "Operazione non trovata." }, 404);
  } catch (error) {
    if (error.code)
      return json(
        {
          error: "Servizio notifiche Android temporaneamente non disponibile.",
        },
        503,
      );
    return json({ error: error.message || "Operazione non riuscita." }, 400);
  }
}
