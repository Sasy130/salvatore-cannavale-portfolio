import { Pool } from "pg";
import { migrationPlan } from "../../src/features/casa-mia/server/migration-plan.mjs";
const connectionString = process.env.CASA_MIA_DATABASE_URL;
if (!connectionString) {
  console.error("Configura CASA_MIA_DATABASE_URL nel tuo ambiente sicuro.");
  process.exit(1);
}
let pool;
try {
  const plan = await migrationPlan();
  if (process.argv.includes("--http")) {
    const host = new URL(connectionString).hostname;
    if (!host.endsWith(".neon.tech")) throw Error("Neon HTTPS only");
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(connectionString, {
      fetchOptions: { signal: AbortSignal.timeout(30000) },
    });
    await sql.query(plan);
  } else {
    pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000,
      query_timeout: 30000,
    });
    await pool.query(plan);
  }
  console.log(
    "CASA MIA: schema PostgreSQL v5 pronto. Nessun dato demo inserito.",
  );
} catch (error) {
  console.error(
    "Migrazione non completata (" +
      (error.code || error.name || "connection_or_schema_error") +
      "). Nessun segreto mostrato.",
  );
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
