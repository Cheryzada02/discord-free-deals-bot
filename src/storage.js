import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configurar __dirname en ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Ruta del archivo seen.json ---
const filePath = path.join(__dirname, '../data/seen.json');

// --- Cargar datos existentes ---
let data = {};
try {
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    data = { epic: [], steam: [] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error('Error leyendo seen.json:', err.message);
}

// --- Función para guardar cambios ---
function save() {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- Agregar un ID a un tipo (epic o steam) ---
function add(type, id) {
  if (!data[type]) data[type] = [];
  if (data[type].includes(id)) return false;
  data[type].push(id);
  save();
  return true;
}

// --- Verificar si existe ---
function has(type, id) {
  if (!data[type]) return false;
  return data[type].includes(id);
}

// --- Export nombrado para ESM ---
export { add, has };
