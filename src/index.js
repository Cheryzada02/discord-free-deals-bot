import { client } from './discordClient.js';
import { startScheduler, checkAll } from './scheduler.js';
import fs from 'fs';
import express from 'express';
import config from './config.js';

// --- CREAR seen.json SI NO EXISTE ---
const dataDir = './data';
const seenFile = `${dataDir}/seen.json`;

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(seenFile)) {
  fs.writeFileSync(seenFile, JSON.stringify({ epic: [], steam: [] }, null, 2));
  console.log('✅ Archivo seen.json creado automáticamente');
}

// --- SERVIDOR HTTP MÍNIMO PARA RENDER ---
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('✅ Bot activo en Render'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// --- AUTO PING PARA MANTENER EL BOT ACTIVO ---
setInterval(() => {
  require('http').get(`http://localhost:${PORT}`);
  console.log('🔄 Auto ping al servidor para mantener activo');
}, 5 * 60 * 1000); // cada 5 minutos

// --- LOGICA DEL BOT DE DISCORD ---
client.once('ready', async () => {
  console.log(`✅ Bot listo: ${client.user.tag}`);

  // Cambiar presencia
  client.user.setPresence({
    activities: [{ name: 'ofertas gratis', type: 3 }], // 3 = Watching
    status: 'online'
  });

  try {
    console.log('[Startup] Comprobando ofertas inmediatamente...');
    await checkAll(client);
  } catch (err) {
    console.error('Error en el chequeo inicial:', err.message);
  }

  startScheduler(client);
});

// Login del bot
client.login(config.discordToken).catch(err => {
  console.error('Error al login:', err.message);
});
