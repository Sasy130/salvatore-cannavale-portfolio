import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { migrationPlan } from "../../src/features/casa-mia/server/migration-plan.mjs";
test("the shared migration block creates schema v5 atomically and can be rerun without changing records", async () => {
  const pg = new PGlite();
  try {
    const plan = await migrationPlan();
    await pg.exec(plan);
    await pg.exec(plan);
    const versions = await pg.query(
      "SELECT version FROM casa_mia.schema_migrations ORDER BY version",
    );
    assert.deepEqual(
      versions.rows.map((r) => r.version),
      [1, 2, 3, 4, 5],
    );
    assert.equal(
      Number(
        (await pg.query("SELECT count(*) n FROM casa_mia.bookings")).rows[0].n,
      ),
      0,
    );
    assert.ok(
      (await pg.query("SELECT to_regclass('casa_mia.push_outbox') AS t"))
        .rows[0].t,
    );
  } finally {
    await pg.close();
  }
});
