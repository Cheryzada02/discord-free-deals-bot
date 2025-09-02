import { client } from './discordClient.js';
import { startScheduler, checkAll } from './scheduler.js';
import fs from 'fs';
import express from 'express';
import fetch from 'node-fetch';
import config from './config.js';
import { logToDiscord } from './logger.js';

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

// --- AUTO PING PARA MANTENER ACTIVO EL BOT ---
const SELF_URL = "https://discord-free-deals-bot.onrender.com";

setInterval(async () => {
  try {
    const res = await fetch(SELF_URL);
    if (res.ok) {
      const msg = `🔄 Auto-ping exitoso a ${SELF_URL} (${res.status})`;
      console.log(msg);
      await logToDiscord(client, msg, 'info');
    } else {
      const msg = `⚠️ Auto-ping falló (${res.status})`;
      console.error(msg);
      await logToDiscord(client, msg, 'error');
    }
  } catch (err) {
    const msg = `❌ Error en auto-ping: ${err.message}`;
    console.error(msg);
    await logToDiscord(client, msg, 'error');
  }
}, 5 * 60 * 1000); // cada 5 minutos

// --- LOGICA DEL BOT DE DISCORD ---
client.once('ready', async () => {
  console.log(`✅ Bot listo: ${client.user.tag}`);
  await logToDiscord(client, `✅ Bot iniciado como **${client.user.tag}**`, 'success');

  // Cambiar presencia
  client.user.setPresence({
    activities: [{ name: 'ofertas gratis', type: 3 }], // 3 = Watching
    status: 'online'
  });

  try {
    console.log('[Startup] Comprobando ofertas inmediatamente...');
    await checkAll(client);
    await logToDiscord(client, '📦 Chequeo inicial de ofertas completado', 'info');
  } catch (err) {
    console.error('❌ Error en el chequeo inicial:', err.message);
    await logToDiscord(client, `❌ Error en chequeo inicial: ${err.message}`, 'error');
  }

  startScheduler(client);
});

// Login del bot
client.login(config.discordToken).catch(async (err) => {
  console.error('❌ Error al login:', err.message);
  await logToDiscord(client, `❌ Error al login: ${err.message}`, 'error');
});
