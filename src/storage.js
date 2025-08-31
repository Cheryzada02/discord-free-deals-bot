const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/seen.json');
let data = {};

try {
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
} catch (err) {
  console.error('Error leyendo seen.json:', err.message);
}

function save() {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function add(type, id) {
  if (!data[type]) data[type] = [];
  if (data[type].includes(id)) return false;
  data[type].push(id);
  save();
  return true;
}

module.exports = { add };
