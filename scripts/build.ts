import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const packages = ['core', 'providers', 'react'];

function cleanDist(pkg: string) {
  const distPath = join(__dirname, '../packages', pkg, 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true });
    console.log(`Cleaned dist folder for ${pkg}`);
  }
}

function buildPackage(pkg: string) {
  console.log(`Building ${pkg}...`);
  execSync(`pnpm --filter @auth-mate/${pkg} build`, { stdio: 'inherit' });
}

// Clean and build packages in correct order
packages.forEach(cleanDist);
packages.forEach(buildPackage);