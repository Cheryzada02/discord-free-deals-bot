// src/config.js
import 'dotenv/config';

const required = ['DISCORD_TOKEN', 'CHANNEL_ID'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const config = Object.freeze({
  discordToken: process.env.DISCORD_TOKEN,
  channelId: process.env.CHANNEL_ID,
  logChannelId: process.env.LOG_CHANNEL_ID || null,
  cronExpr: process.env.CHECK_CRON || '*/30 * * * *',
  userAgent: process.env.USER_AGENT || 'free-deals-bot/1.0',
  selfUrl: process.env.SELF_URL || 'https://discord-free-deals-bot-mk34.onrender.com',
  cronTz: process.env.CRON_TZ || 'UTC',
  sendDelayMs: Number(process.env.SEND_DELAY_MS || 1200),
  steamLimit: Number(process.env.STEAM_LIMIT || 50),
  batchEmbeds: process.env.BATCH_EMBEDS === '1',
  // Umbral mínimo de descuento en Steam para avisar (en %)
  steamMinDiscount: Number(process.env.STEAM_MIN_DISCOUNT || 20),
  // Localización/Moneda para formatear precios
  locale: process.env.LOCALE || 'es-ES',
  currency: process.env.CURRENCY || 'USD'
});
