import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PackageInfo {
  name: string;
  version: string;
  private: boolean;
  path: string;
}

export function getPackages(): PackageInfo[] {
  const packagesDir = join(__dirname, '../../packages');
  return readdirSync(packagesDir)
    .filter(dir => !dir.startsWith('.'))
    .map(dir => {
      const pkgPath = join(packagesDir, dir);
      const pkgJson = JSON.parse(
        readFileSync(join(pkgPath, 'package.json'), 'utf8')
      );
      return {
        name: pkgJson.name,
        version: pkgJson.version,
        private: !!pkgJson.private,
        path: pkgPath,
      };
    });
}