import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
const rows = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
const digest = (s) => createHash("sha256").update(s).digest("hex");
const configured = (env) =>
  typeof env.NATIVE_AUTH_SECRET === "string" &&
  env.NATIVE_AUTH_SECRET.length >= 32 &&
  typeof env.ADMIN_PASSWORD === "string" &&
  env.ADMIN_PASSWORD.length >= 12;
const fingerprint = (env, type, value) =>
  createHmac("sha256", env.NATIVE_AUTH_SECRET)
    .update(type + ":" + value)
    .digest("hex");
async function input(req) {
  const text = await req.text();
  if (text.length > 2000) throw Error("Richiesta troppo grande.");
  return JSON.parse(text);
}
async function rate(db, key, max, ttl) {
  const now = Date.now();
  const record = (
    await rows(
      db,
      "INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.expires<=? THEN 1 ELSE attempts.count+1 END,expires=CASE WHEN attempts.expires<=? THEN EXCLUDED.expires ELSE attempts.expires END RETURNING count",
      key,
      now + ttl,
      now,
      now,
    )
  )[0];
  return Number(record.count) <= max;
}
export async function revokeNativeAuth(env, id) {
  if (typeof id !== "string" || !id) return;
  await env.DB.transaction(async (tx) => {
    const record = (
      await rows(
        tx,
        "SELECT session_hash FROM native_auth_devices WHERE id=? FOR UPDATE",
        id,
      )
    )[0];
    if (record)
      await tx
        .prepare("DELETE FROM sessions WHERE native_auth_id=?")
        .bind(id)
        .run();
    await tx
      .prepare(
        "UPDATE native_auth_devices SET revoked=TRUE,session_hash=NULL WHERE id=?",
      )
      .bind(id)
      .run();
  });
}
export async function nativeRefresh(req, env) {
  if (req.method !== "POST")
    return json({ error: "Metodo non consentito." }, 405);
  if (!configured(env))
    return json(
      {
        error:
          "Accesso biometrico temporaneamente non disponibile. Usa la password.",
      },
      503,
    );
  try {
    const ip = (
      req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-forwarded-for") ||
      "local"
    )
      .split(",")[0]
      .trim();
    if (!(await rate(env.DB, "native-refresh:" + digest(ip), 30, 60000)))
      return json({ error: "Troppi tentativi. Riprova tra un minuto." }, 429);
    const body = await input(req);
    if (
      typeof body.credential !== "string" ||
      !/^[\w-]{43}$/.test(body.credential)
    )
      return json(
        { error: "Accesso biometrico scaduto o revocato. Usa la password." },
        401,
      );
    const credentialHash = fingerprint(env, "credential", body.credential),
      current = fingerprint(env, "password", env.ADMIN_PASSWORD),
      token = randomBytes(48).toString("base64url"),
      sessionHash = digest(token);
    const valid = await env.DB.transaction(async (tx) => {
      const record = (
        await rows(
          tx,
          "SELECT * FROM native_auth_devices WHERE credential_hash=? FOR UPDATE",
          credentialHash,
        )
      )[0];
      if (
        !record ||
        record.revoked ||
        Number(record.expires) <= Date.now() ||
        record.password_fingerprint.length !== current.length ||
        !timingSafeEqual(
          Buffer.from(record.password_fingerprint),
          Buffer.from(current),
        )
      )
        return false;
      await tx
        .prepare("DELETE FROM sessions WHERE native_auth_id=? AND expires<=?")
        .bind(record.id, Date.now())
        .run();
      await tx
        .prepare("INSERT INTO sessions(token,expires,native_auth_id) VALUES(?,?,?)")
        .bind(sessionHash, Date.now() + 28800000,record.id)
        .run();
      await tx
        .prepare(
          "UPDATE native_auth_devices SET session_hash=?,last_used=? WHERE id=?",
        )
        .bind(sessionHash, new Date().toISOString(), record.id)
        .run();
      return true;
    });
    if (!valid)
      return json(
        { error: "Accesso biometrico scaduto o revocato. Usa la password." },
        401,
      );
    return json({ ok: true }, 200, {
      "Set-Cookie": `casa_mia_owner=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
    });
  } catch (error) {
    return json(
      {
        error:
          "Impossibile completare l’accesso biometrico. Usa la password o riprova.",
      },
      error.code ? 503 : 400,
    );
  }
}
export async function handleNativeAuth(path, req, env) {
  try {
    if (path === "admin/native/auth" && req.method === "GET")
      return json({
        configured: configured(env),
        devices: await rows(
          env.DB,
          "SELECT id,label,expires,revoked,created,last_used FROM native_auth_devices ORDER BY created DESC LIMIT 50",
        ),
      });
    if (req.method !== "POST")
      return json({ error: "Metodo non consentito." }, 405);
    const body = await input(req);
    if (path === "admin/native/auth/revoke") {
      await revokeNativeAuth(env, body.id);
      return json({ ok: true });
    }
    if (path !== "admin/native/auth/enroll")
      return json({ error: "Operazione non trovata." }, 404);
    if (!configured(env))
      return json(
        { error: "Accesso biometrico non ancora configurato sul server." },
        409,
      );
    if (
      !(await rate(
        env.DB,
        "native-enroll:" + digest(req.headers.get("cookie") || ""),
        12,
        3600000,
      ))
    )
      return json(
        { error: "Troppi tentativi di attivazione. Riprova più tardi." },
        429,
      );
    const credential = randomBytes(32).toString("base64url"),
      id = crypto.randomUUID(),
      expires = Date.now() + 90 * 86400000;
    await env.DB.transaction(async (tx) => {
      await rows(
        tx,
        "SELECT version FROM schema_migrations WHERE version=7 FOR UPDATE",
      );
      if (typeof body.replaceId === "string" && body.replaceId) {
        const old = (
          await rows(
            tx,
            "SELECT session_hash FROM native_auth_devices WHERE id=? FOR UPDATE",
            body.replaceId,
          )
        )[0];
        if (old)
          await tx
            .prepare("DELETE FROM sessions WHERE native_auth_id=?")
            .bind(body.replaceId)
            .run();
        await tx
          .prepare(
            "UPDATE native_auth_devices SET revoked=TRUE,session_hash=NULL WHERE id=?",
          )
          .bind(body.replaceId)
          .run();
      }
      const count = Number(
        (
          await rows(
            tx,
            "SELECT count(*) n FROM native_auth_devices WHERE revoked=FALSE AND expires>?",
            Date.now(),
          )
        )[0].n,
      );
      if (count >= 10)
        throw Error(
          "Sono già abilitati dieci accessi. Disattivane uno prima di continuare.",
        );
      await tx
        .prepare(
          "INSERT INTO native_auth_devices(id,credential_hash,password_fingerprint,label,expires,created) VALUES(?,?,?,?,?,?)",
        )
        .bind(
          id,
          fingerprint(env, "credential", credential),
          fingerprint(env, "password", env.ADMIN_PASSWORD),
          typeof body.label === "string"
            ? body.label.trim().slice(0, 60)
            : "Telefono Android",
          expires,
          new Date().toISOString(),
        )
        .run();
    });
    return json({ id, credential, expires }, 201);
  } catch (error) {
    return json(
      {
        error: error.code
          ? "Servizio biometrico temporaneamente non disponibile."
          : error.message || "Operazione non riuscita.",
      },
      error.code ? 503 : 400,
    );
  }
}
