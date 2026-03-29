import { readFile } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

const IGNORE = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**', '**/out/**'];

export async function detectProject(dir) {
  let pkg = null;
  try {
    pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
  } catch {}

  const allDeps = { ...pkg?.dependencies, ...pkg?.devDependencies };

  let type = 'unknown';
  if (allDeps?.next) type = 'Next.js';
  else if (allDeps?.nuxt) type = 'Nuxt';
  else if (allDeps?.vue) type = 'Vue';
  else if (allDeps?.svelte || allDeps?.['@sveltejs/kit']) type = 'Svelte';
  else if (allDeps?.react) type = 'React';
  else {
    // Check for plain HTML
    const htmlFiles = await glob('**/*.html', { cwd: dir, ignore: IGNORE });
    if (htmlFiles.length > 0) type = 'HTML';
    else if (pkg) type = 'Node.js';
  }

  const files = await glob('**/*.{js,ts,jsx,tsx,html,vue,svelte,css}', {
    cwd: dir,
    ignore: IGNORE,
  });

  return {
    name: pkg?.name || dir.split('/').pop(),
    type,
    pkg,
    files,
    dir,
  };
}
