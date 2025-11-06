// src/scheduler.js
import cron from 'node-cron';
import { add } from './storage.js';
import { fetchEpicPromotions } from './services/epicService.js';
import { fetchSteamDiscounts } from './services/steamService.js';
import { buildEpicEmbed, buildSteamEmbed, sendEmbedToChannel } from './discordUtils.js';
import { config } from './config.js';
import { logToDiscord } from './logger.js';
import { makeItemKey, makeSteamPriceKey } from './utils.js';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

let running = false; // anti-solapamiento

async function sendEmbedsSafely(client, embeds) {
  if (!embeds.length) return;

  if (config.batchEmbeds) {
    for (let i = 0; i < embeds.length; i += 10) {
      const chunk = embeds.slice(i, i + 10);
      try {
        await sendEmbedToChannel(client, chunk.length === 1 ? chunk[0] : chunk);
      } catch (err) {
        console.error('[sendEmbedsSafely] Error enviando chunk:', err.message);
        await logToDiscord(client, `Error enviando batch de embeds: ${err.message}`, 'error').catch(() => {});
      }
      await sleep(config.sendDelayMs);
    }
    return;
  }

  for (const embed of embeds) {
    try {
      await sendEmbedToChannel(client, embed);
    } catch (err) {
      console.error('[sendEmbedsSafely] Error enviando embed:', err.message);
      await logToDiscord(client, `Error enviando embed: ${err.message}`, 'error').catch(() => {});
    }
    await sleep(config.sendDelayMs);
  }
}

export async function checkAll(client) {
  if (running) {
    console.log('[scheduler] Evitado: ejecución previa aún en curso.');
    return { skipped: true, epicNew: 0, steamNew: 0, epicTotal: 0, steamTotal: 0 };
  }
  running = true;

  console.log('[scheduler] Comprobando ofertas...');
  const result = { skipped: false, epicNew: 0, steamNew: 0, epicTotal: 0, steamTotal: 0 };

  // EPIC — SOLO GRATIS
  try {
    const epicItems = await fetchEpicPromotions(); // filtra a gratis en el service
    result.epicTotal = epicItems.length;

    const epicEmbeds = [];
    for (const item of epicItems) {
      const key = makeItemKey('epic', item);
      if (!key) continue;
      const added = await add('epic', key);
      if (!added) continue;

      try {
        epicEmbeds.push(buildEpicEmbed(item));
        result.epicNew++;
        console.log('[Epic] Nuevo:', item.title);
      } catch (e) {
        console.error('[Epic] Error construyendo embed:', e.message, item?.title);
      }
    }
    await sendEmbedsSafely(client, epicEmbeds);
  } catch (err) {
    console.error('[Epic] Error en fetch:', err.message);
    await logToDiscord(client, `EPIC: error en fetch: ${err.message}`, 'error').catch(() => {});
  }

  // STEAM — REBAJAS / BAJAS DE PRECIO (min discount en config)
  try {
    const steamItems = await fetchSteamDiscounts(config.steamMinDiscount, config.steamLimit);
    result.steamTotal = steamItems.length;

    const steamEmbeds = [];
    for (const item of steamItems) {
      // clave depende del precio final → noticia solo si bajó o subió a un nuevo precio
      const key = makeSteamPriceKey(item);
      if (!key) continue;
      const added = await add('steam', key);
      if (!added) continue;

      try {
        steamEmbeds.push(buildSteamEmbed(item));
        result.steamNew++;
        console.log('[Steam] Nuevo descuento:', item.title, item.discountPercent, '%');
      } catch (e) {
        console.error('[Steam] Error construyendo embed:', e.message, item?.title);
      }
    }
    await sendEmbedsSafely(client, steamEmbeds);
  } catch (err) {
    console.error('[Steam] Error en fetch:', err.message);
    await logToDiscord(client, `STEAM: error en fetch: ${err.message}`, 'error').catch(() => {});
  }

  const summary = `Resumen → Epic: ${result.epicNew}/${result.epicTotal} nuevos | Steam: ${result.steamNew}/${result.steamTotal} nuevos`;
  console.log('[scheduler]', summary);
  if ((result.epicNew + result.steamNew) > 0) {
    await logToDiscord(client, `📦 ${summary}`, 'info').catch(() => {});
  }

  running = false;
  return result;
}

export function startScheduler(client) {
  if (!cron.validate(config.cronExpr)) {
    const msg = `Expresión CRON inválida: "${config.cronExpr}"`;
    console.error('[scheduler]', msg);
    logToDiscord(client, `❌ ${msg}`, 'error').catch(() => {});
    return;
  }

  cron.schedule(
    config.cronExpr,
    () => {
      checkAll(client).catch((err) => {
        console.error('Error en cron:', err.message);
        logToDiscord(client, `⏰ Error en tarea programada: ${err.message}`, 'error').catch(() => {});
      });
    },
    { timezone: config.cronTz }
  );

  console.log(`[scheduler] Iniciado con CRON="${config.cronExpr}" TZ="${config.cronTz}"`);
  logToDiscord(client, `⏰ Scheduler iniciado (CRON: \`${config.cronExpr}\`, TZ: \`${config.cronTz}\`)`, 'info').catch(() => {});
}
