import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../snippets/', import.meta.url);
const files = (await readdir(root)).filter((file) => file.endsWith('.code-snippets'));
const prefixes = new Map();
const errors = [];
for (const file of files) {
  const text = await readFile(new URL(file, root), 'utf8');
  const parsed = JSON.parse(text.replace(/,\s*([}\]])/gu, '$1'));
  for (const [name, snippet] of Object.entries(parsed)) {
    if (!snippet.description || !snippet.body || !snippet.prefix) errors.push(`${file}: ${name} is incomplete`);
    const values = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
    for (const prefix of values) {
      const key = `${file}:${prefix}`;
      if (prefixes.has(key)) errors.push(`${file}: duplicate prefix ${prefix}`);
      prefixes.set(key, `${file}:${name}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Validated ${prefixes.size} Uriel Snips prefixes.`);
