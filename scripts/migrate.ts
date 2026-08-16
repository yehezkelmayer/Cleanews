import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const sql = postgres(url, { prepare: false, max: 1 });
  const ddl = readFileSync(resolve('src/lib/schema.sql'), 'utf8');

  console.log('Applying schema…');
  await sql.unsafe(ddl);
  console.log('Schema applied.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
