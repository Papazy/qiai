import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'config.json');

export function patchConfig(updates) {
  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch {}
  Object.assign(existing, updates);
  fs.writeFileSync(configPath, JSON.stringify(existing, null, 2), 'utf8');
}
