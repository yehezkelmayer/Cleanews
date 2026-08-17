import postgres from 'postgres';
import { DATABASE_SCHEMA_SQL } from '../src/lib/schema';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const sql = postgres(url, { prepare: false, max: 1 });
  console.log('Applying schema…');
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext('cleanews-schema'))`;
    await tx.unsafe(DATABASE_SCHEMA_SQL);
  });
  console.log('Schema applied.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
