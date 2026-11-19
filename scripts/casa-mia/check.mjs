import { Pool } from "pg";
import { pushConfig } from "../../src/features/casa-mia/server/push.mjs";
const e = process.env;
const checks = {
  databaseConfigured: !!e.CASA_MIA_DATABASE_URL,
  databaseReachable: false,
  schemaReady: false,
  ownerAccess: (e.CASA_MIA_ADMIN_PASSWORD?.length || 0) >= 12,
  bookingRequested: e.CASA_MIA_ENABLE_BOOKING === "true",
  emailConfigured: !!e.CASA_MIA_RESEND_API_KEY && !!e.CASA_MIA_MAIL_FROM,
  emailWorkerConfigured: (e.CASA_MIA_MAIL_JOB_SECRET?.length || 0) >= 32,
  stripeTestConfigured:
    !!e.CASA_MIA_STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
    !!e.CASA_MIA_STRIPE_WEBHOOK_SECRET,
  pushConfigured: !!pushConfig({
    PUSH_PUBLIC_KEY: e.CASA_MIA_PUSH_PUBLIC_KEY,
    PUSH_PRIVATE_KEY: e.CASA_MIA_PUSH_PRIVATE_KEY,
    PUSH_SUBJECT: e.CASA_MIA_PUSH_SUBJECT,
  }),
  pushWorkerConfigured: (e.CASA_MIA_PUSH_JOB_SECRET?.length || 0) >= 32,
};
if (e.CASA_MIA_DATABASE_URL) {
  const pool = new Pool({
    connectionString: e.CASA_MIA_DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });
  try {
    const r = await pool.query(
      "SELECT version FROM casa_mia.schema_migrations WHERE version=5",
    );
    checks.databaseReachable = true;
    checks.schemaReady = r.rows.length === 1;
  } catch {
  } finally {
    await pool.end();
  }
}
const ready =
  checks.databaseReachable &&
  checks.schemaReady &&
  checks.ownerAccess &&
  checks.bookingRequested;
if (process.argv.includes("--json"))
  console.log(
    JSON.stringify(
      { checks, bookingReady: ready, paymentMode: "test" },
      null,
      2,
    ),
  );
else {
  console.log(
    "CASA MIA — verifica configurazione (nessun segreto viene mostrato)",
  );
  for (const [name, ok] of Object.entries(checks))
    console.log((ok ? "OK  " : "--- ") + name);
  console.log(
    ready
      ? "Calendario condiviso pronto per il collaudo."
      : "Calendario condiviso non ancora pronto. Completa la configurazione prima di abilitare prenotazioni reali.",
  );
  console.log(
    "I controlli dei servizi indicano configurazione, non consegna email/push o accrediti reali verificati.",
  );
}
if (!ready) process.exitCode = 1;
