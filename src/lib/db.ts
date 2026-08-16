import postgres from 'postgres';

declare global {
  var __cleanews_sql: ReturnType<typeof postgres> | undefined;
}

/**
 * Lazy singleton — the connection is only established on first query.
 * This keeps build-time page-config collection from failing when
 * DATABASE_URL is absent in the build environment.
 */
function makeClient(): ReturnType<typeof postgres> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  return postgres(url, { prepare: false, max: 5, idle_timeout: 20 });
}

function getClient(): ReturnType<typeof postgres> {
  if (!global.__cleanews_sql) {
    global.__cleanews_sql = makeClient();
  }
  return global.__cleanews_sql;
}

type Sql = ReturnType<typeof postgres>;

export const sql: Sql = new Proxy(function () {} as unknown as Sql, {
  apply(_target, thisArg, args) {
    // Tagged-template call: sql`SELECT …`
    const client = getClient() as unknown as (...a: unknown[]) => unknown;
    return Reflect.apply(client, thisArg, args);
  },
  get(_target, prop) {
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    if (typeof value === 'function') return (value as (...a: unknown[]) => unknown).bind(client);
    return value;
  },
});
