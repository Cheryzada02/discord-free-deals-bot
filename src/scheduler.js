// src/scheduler.js
import cron from 'node-cron';
import { add } from './storage.js';
import { fetchEpicPromotions } from './services/epicService.js';
import { fetchSteamDiscounts } from './services/steamService.js';
import { buildEpicEmbed, buildSteamEmbed, sendEmbedToChannel } from './discordUtils.js';
import { config } from './config.js';

export async function checkAll(client) {
  console.log('[scheduler] Comprobando ofertas...');

  const epicItems = await fetchEpicPromotions();
  for (const item of epicItems) {
    const added = add('epic', item.id);
    if (added) {
      const embed = buildEpicEmbed(item);
      await sendEmbedToChannel(client, embed);
      console.log('[Epic] Nuevo:', item.title);
    }
  }

  const steamItems = await fetchSteamDiscounts(50);
  for (const item of steamItems) {
    const added = add('steam', item.id);
    if (added) {
      const embed = buildSteamEmbed(item);
      await sendEmbedToChannel(client, embed);
      console.log('[Steam] Nuevo descuento:', item.title, item.discountPercent);
    }
  }
}

export function startScheduler(client) {
  cron.schedule(config.cronExpr, () => {
    checkAll(client).catch(err => console.error('Error en cron:', err.message));
  });
}
