import { execSync } from 'child_process';

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const coverage = args.includes('--coverage');

let command = 'pnpm -r test';
if (watchMode) command = 'pnpm -r test:watch';
if (coverage) command = 'pnpm -r test:coverage';

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}