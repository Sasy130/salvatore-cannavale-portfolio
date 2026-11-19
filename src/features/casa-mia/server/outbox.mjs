import { emailMessage, receiptPDF } from "./receipt.mjs";
const all = async (db, sql, ...args) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results;
export function mailJob(db, booking, kind = "confirmation", receipt = null) {
  const payload = JSON.stringify({
    booking: {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      checkin: booking.checkin,
      checkout: booking.checkout,
      guests: booking.guests,
      total: booking.total,
      payment: booking.payment,
      status: booking.status,
    },
    receipt,
  });
  return db
    .prepare(
      "INSERT INTO email_outbox(id,dedupe_key,booking_id,receipt_id,kind,recipient,payload,created) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(dedupe_key) DO NOTHING",
    )
    .bind(
      crypto.randomUUID(),
      kind + ":" + (receipt?.id || booking.id),
      booking.id,
      receipt?.id || null,
      kind,
      booking.email,
      payload,
      new Date().toISOString(),
    );
}
export async function queueConfirmation(env, b) {
  if (!b.email) return false;
  await mailJob(env.DB, b).run();
  await deliverEmails(env, { bookingId: b.id, limit: 1 });
  const rows = await all(
    env.DB,
    "SELECT status FROM email_outbox WHERE dedupe_key=?",
    "confirmation:" + b.id,
  );
  return rows[0]?.status === "sent";
}
export async function deliverEmails(
  env,
  { limit = 5, bookingId = null, jobId = null } = {},
) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM)
    return { sent: 0, configured: false };
  const db = env.DB,
    results = { sent: 0, processed: 0, configured: true };
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const job = await db.transaction(async (tx) => {
      const now = Date.now(),
        rows = await all(
          tx,
          "SELECT * FROM email_outbox WHERE ((status='queued' AND next_attempt<=?) OR (status='sending' AND locked_until<?)) AND (?::text IS NULL OR booking_id=?) AND (?::text IS NULL OR id=?) ORDER BY created FOR UPDATE SKIP LOCKED LIMIT 1",
          now,
          now,
          bookingId,
          bookingId,
          jobId,
          jobId,
        ),
        j = rows[0];
      if (!j) return null;
      if (
        j.attempts >= 8 ||
        (j.first_attempt && now - Number(j.first_attempt) > 23 * 3600000)
      ) {
        await tx
          .prepare(
            "UPDATE email_outbox SET status='review',last_error='delivery_window_expired',locked_until=NULL WHERE id=?",
          )
          .bind(j.id)
          .run();
        return { skip: true };
      }
      const b = (
        await all(tx, "SELECT status FROM bookings WHERE id=?", j.booking_id)
      )[0];
      if (j.kind === "confirmation" && b?.status !== "confirmed") {
        await tx
          .prepare(
            "UPDATE email_outbox SET status='superseded',locked_until=NULL WHERE id=?",
          )
          .bind(j.id)
          .run();
        return { skip: true };
      }
      let envelope = j.envelope;
      if (!envelope) {
        const payload = JSON.parse(j.payload),
          message = emailMessage(payload);
        const input = { from: env.MAIL_FROM, to: [j.recipient], ...message };
        if (payload.receipt)
          input.attachments = [
            {
              filename: "CASA-MIA-" + payload.receipt.id + ".pdf",
              content: receiptPDF(payload.receipt).toString("base64"),
            },
          ];

        envelope = JSON.stringify(input);
      }
      await tx
        .prepare(
          "UPDATE email_outbox SET envelope=?,status='sending',attempts=attempts+1,first_attempt=COALESCE(first_attempt,?),locked_until=? WHERE id=?",
        )
        .bind(envelope, now, now + 60000, j.id)
        .run();
      return { ...j, envelope, attempts: j.attempts + 1 };
    });
    if (!job) break;
    if (job.skip) continue;
    results.processed++;
    let response,
      providerId,
      error = "network_error",
      permanent = false;
    try {
      response = await (env.FETCH || fetch)("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "casa-mia/" + job.id,
        },
        body: job.envelope,
      });
      let result;
      try {
        result = await response.json();
      } catch {}
      if (response.ok && typeof result?.id === "string") providerId = result.id;
      else {
        error = "provider_http_" + response.status;
        permanent =
          response.status >= 400 &&
          response.status < 500 &&
          ![408, 409, 429].includes(response.status);
      }
    } catch {}
    if (providerId) {
      await db
        .prepare(
          "UPDATE email_outbox SET status='sent',provider_id=?,sent_at=?,locked_until=NULL,last_error=NULL WHERE id=? AND status='sending'",
        )
        .bind(providerId, new Date().toISOString(), job.id)
        .run();
      results.sent++;
    } else {
      await db
        .prepare(
          "UPDATE email_outbox SET status=?,next_attempt=?,locked_until=NULL,last_error=? WHERE id=? AND status='sending'",
        )
        .bind(
          permanent || job.attempts >= 8 ? "review" : "queued",
          Date.now() + Math.min(3600000, 30000 * 2 ** (job.attempts - 1)),
          error,
          job.id,
        )
        .run();
    }
  }
  return results;
}
