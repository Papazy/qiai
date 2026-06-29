import { main } from './cli/args.js';

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
