import { Pool } from "pg";
import { readFile } from "node:fs/promises";
if (!process.env.CASA_MIA_DATABASE_URL)
  throw Error("Configura CASA_MIA_DATABASE_URL nel tuo ambiente sicuro.");
const pool = new Pool({
  connectionString: process.env.CASA_MIA_DATABASE_URL,
  max: 1,
});
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    await readFile(
      new URL("../../src/features/casa-mia/server/schema.sql", import.meta.url),
      "utf8",
    ),
  );
  const applied = await client.query(
    "SELECT version FROM schema_migrations WHERE version=2",
  );
  if (!applied.rows.length)
    await client.query(
      await readFile(
        new URL(
          "../../src/features/casa-mia/server/migrations/002_owner_operations.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  if (
    !(
      await client.query(
        "SELECT version FROM schema_migrations WHERE version=3",
      )
    ).rows.length
  )
    await client.query(
      await readFile(
        new URL(
          "../../src/features/casa-mia/server/migrations/003_stay_operations.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  await client.query("COMMIT");
  console.log(
    "CASA MIA: schema PostgreSQL v3 pronto. Nessun dato demo inserito.",
  );
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
  await pool.end();
}
