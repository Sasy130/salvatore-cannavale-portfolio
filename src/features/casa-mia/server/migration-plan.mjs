import { readFile } from "node:fs/promises";
// Only repository-authored SQL is embedded. The block is atomic and serializes migrations.
export async function migrationPlan() {
  const initial = await readFile(
    new URL("./schema.sql", import.meta.url),
    "utf8",
  );
  const files = [
    "002_owner_operations.sql",
    "003_stay_operations.sql",
    "004_receipts_outbox.sql",
    "005_web_push.sql",
    "006_native_android.sql",
    "007_native_biometric_auth.sql",
  ];
  let body = "PERFORM pg_advisory_xact_lock(51896533);\n" + initial;
  for (let i = 0; i < files.length; i++) {
    const sql = await readFile(
      new URL("./migrations/" + files[i], import.meta.url),
      "utf8",
    );
    body += `\nIF NOT EXISTS(SELECT 1 FROM casa_mia.schema_migrations WHERE version=${i + 2}) THEN\n${sql}\nEND IF;\n`;
  }
  return (
    "DO $casa_mia_migration$ BEGIN\n" + body + "\nEND $casa_mia_migration$;"
  );
}
