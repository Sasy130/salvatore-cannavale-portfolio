// Only authored SQL uses '?' placeholders; untrusted values always remain bound parameters.
const parameterize = (sql) => {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
};
function scope(executor) {
  return {
    prepare(sql) {
      return {
        sql: parameterize(sql),
        args: [],
        bind(...args) {
          return { ...this, args };
        },
        async all() {
          const result = await executor.query(this.sql, this.args);
          return { results: result.rows };
        },
        async run() {
          return executor.query(this.sql, this.args);
        },
      };
    },
  };
}
export function postgresAdapter(pool) {
  async function transaction(work) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(scope(client));
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  return {
    ...scope(pool),
    transaction,
    async batch(statements) {
      return transaction(async (tx) => {
        const results = [];
        for (const s of statements)
          results.push(
            await tx
              .prepare(s.sql)
              .bind(...s.args)
              .run(),
          );
        return results;
      });
    },
  };
}
