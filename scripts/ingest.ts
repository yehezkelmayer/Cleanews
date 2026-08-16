import 'dotenv/config';
import { runIngestion } from '../src/lib/ingest';

runIngestion()
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
