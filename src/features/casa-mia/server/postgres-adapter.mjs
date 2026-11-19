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
  async function withTransaction(work) {
    const client = await pool.connect();
    let begun = false;
    try {
      await client.query("BEGIN");
      begun = true;
      // Transaction pooling does not preserve per-session search_path.
      await client.query("SET LOCAL search_path TO casa_mia");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      if (begun) await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  const transaction = (work) =>
    withTransaction((client) => work(scope(client)));
  const executor = {
    query: (sql, args) => withTransaction((client) => client.query(sql, args)),
  };
  return {
    ...scope(executor),
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
