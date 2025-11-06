// src/storage.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/seen.json');

let data = { epic: [], steam: [] };

async function save() {
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
  await fs.rename(tmpPath, filePath);
}

async function load() {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') data = parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
      await save();
    } else {
      console.error('Error leyendo seen.json:', err.message);
    }
  }
}

await load();

/**
 * Agrega una clave si no existe (devuelve true si agregó; false si ya estaba).
 * type: 'epic' | 'steam'
 */
export async function add(type, id) {
  if (!['epic', 'steam'].includes(type)) throw new Error('Tipo inválido');
  if (!id) return false;

  if (!Array.isArray(data[type])) data[type] = [];
  if (data[type].includes(id)) return false;

  data[type].push(id);
  await save();
  return true;
}

export function has(type, id) {
  return Array.isArray(data[type]) && data[type].includes(id);
}
