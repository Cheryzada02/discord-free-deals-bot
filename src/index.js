// src/index.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

import { client } from './discordClient.js';
import { startScheduler, checkAll } from './scheduler.js';
import { config } from './config.js';
import { logToDiscord } from './logger.js';

// fetch nativo Node 18+, fallback a node-fetch
let fetchFn = globalThis.fetch;
if (typeof fetchFn !== 'function') {
  const { default: nodeFetch } = await import('node-fetch');
  fetchFn = nodeFetch;
}

// Rutas ESM-safe
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const seenFile = path.join(dataDir, 'seen.json');

// Bootstrap almacenamiento
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(seenFile)) {
  fs.writeFileSync(seenFile, JSON.stringify({ epic: [], steam: [] }, null, 2));
  console.log('✅ Archivo seen.json creado automáticamente');
}

// Servidor HTTP / healthcheck
const app = express();
const PORT = Number(process.env.PORT) || 10000;

app.get('/', (_req, res) => res.status(200).send('✅ Bot activo en Render'));
app.get('/healthz', (_req, res) => {
  const healthy = client.isReady();
  res.status(healthy ? 200 : 503).json({ ok: healthy, user: healthy ? client.user?.tag : null });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP] Servidor escuchando en el puerto ${PORT}`);
});

// Auto-ping opcional
if (config.selfUrl) {
  setInterval(async () => {
    try {
      const res = await fetchFn(config.selfUrl);
      const ok = res.ok;
      const msg = ok
        ? `🔄 Auto-ping exitoso a ${config.selfUrl} (${res.status})`
        : `⚠️ Auto-ping falló (${res.status})`;

      console[ok ? 'log' : 'error'](msg);
      if (client.isReady() && config.logChannelId) await logToDiscord(client, msg, ok ? 'info' : 'error');
    } catch (err) {
      const msg = `❌ Error en auto-ping: ${err.message}`;
      console.error(msg);
      if (client.isReady() && config.logChannelId) await logToDiscord(client, msg, 'error');
    }
  }, 5 * 60 * 1000);
} else {
  console.log('[AutoPing] Desactivado: no se definió SELF_URL');
}

// Ciclo de vida del bot
client.once('ready', async () => {
  console.log(`✅ Bot listo: ${client.user.tag}`);
  if (config.logChannelId) {
    await logToDiscord(client, `✅ Bot iniciado como **${client.user.tag}**`, 'success');
  }

  client.user.setPresence({
    activities: [{ name: 'ofertas gratis', type: 3 }], // 3 = Watching
    status: 'online'
  });

  try {
    console.log('[Startup] Comprobando ofertas inmediatamente...');
    await checkAll(client);
    if (config.logChannelId) await logToDiscord(client, '📦 Chequeo inicial de ofertas completado', 'info');
  } catch (err) {
    console.error('Error en el chequeo inicial:', err.message);
    if (config.logChannelId) await logToDiscord(client, `❌ Error en chequeo inicial: ${err.message}`, 'error');
  }

  startScheduler(client);
});

// Login
client.login(config.discordToken).catch(async (err) => {
  console.error('Error al login:', err.message);
  if (client.isReady() && config.logChannelId) {
    await logToDiscord(client, `❌ Error al login: ${err.message}`, 'error');
  }
  process.exitCode = 1;
});

// Harden
process.on('unhandledRejection', async (reason) => {
  console.error('[unhandledRejection]', reason);
  if (client.isReady() && config.logChannelId) {
    await logToDiscord(client, `⚠️ unhandledRejection: ${String(reason)}`, 'error');
  }
});
process.on('uncaughtException', async (err) => {
  console.error('[uncaughtException]', err);
  if (client.isReady() && config.logChannelId) {
    await logToDiscord(client, `⚠️ uncaughtException: ${err.message}`, 'error');
  }
});

// Shutdown limpio
async function shutdown(signal) {
  console.log(`[Shutdown] Señal recibida: ${signal}`);
  try {
    if (client.isReady() && config.logChannelId) {
      await logToDiscord(client, `🔻 Apagando por señal: ${signal}`, 'info');
    }
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
