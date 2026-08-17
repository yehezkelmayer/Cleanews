import postgres from 'postgres';
import { DATABASE_SCHEMA_SQL } from './schema';

declare global {
  var __cleanews_sql: ReturnType<typeof postgres> | undefined;
  var __cleanews_schema_ready: Promise<void> | undefined;
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

async function ensureSchema(client: ReturnType<typeof postgres>): Promise<void> {
  if (!global.__cleanews_schema_ready) {
    global.__cleanews_schema_ready = client
      .begin(async (tx) => {
        // Serialise migrations across concurrent serverless cold starts.
        await tx`SELECT pg_advisory_xact_lock(hashtext('cleanews-schema'))`;
        await tx.unsafe(DATABASE_SCHEMA_SQL);
      })
      .then(() => undefined)
      .catch((error) => {
        // A transient connection error should be retryable on the next request.
        global.__cleanews_schema_ready = undefined;
        throw error;
      });
  }

  await global.__cleanews_schema_ready;
}

type Sql = ReturnType<typeof postgres>;

export const sql: Sql = new Proxy(function () {} as unknown as Sql, {
  async apply(_target, _thisArg, args) {
    // Tagged-template call: sql`SELECT …`
    const rawClient = getClient();
    await ensureSchema(rawClient);
    const client = rawClient as unknown as (...a: unknown[]) => unknown;
    return Reflect.apply(client, rawClient, args);
  },
  get(_target, prop) {
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    if (prop === 'begin' && typeof value === 'function') {
      return async (...args: unknown[]) => {
        const rawClient = getClient();
        await ensureSchema(rawClient);
        return Reflect.apply(value as (...a: unknown[]) => unknown, rawClient, args);
      };
    }
    if (typeof value === 'function') return (value as (...a: unknown[]) => unknown).bind(client);
    return value;
  },
});
