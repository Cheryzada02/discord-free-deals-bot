const cron = require('node-cron');
const storage = require('./storage');
const { fetchEpicPromotions } = require('./services/epicService');
const { fetchSteamDiscounts } = require('./services/steamService');
const { buildEpicEmbed, buildSteamEmbed, sendEmbedToChannel } = require('./discordUtils');
const config = require('./config');

async function checkAll(client) {
  console.log('[scheduler] Comprobando ofertas...');

  const epicItems = await fetchEpicPromotions();
  for (const item of epicItems) {
    const added = storage.add('epic', item.id);
    if (added) {
      const embed = buildEpicEmbed(item);
      await sendEmbedToChannel(client, embed);
      console.log('[Epic] Nuevo:', item.title);
    }
  }

  const steamItems = await fetchSteamDiscounts(50);
  for (const item of steamItems) {
    const added = storage.add('steam', item.id);
    if (added) {
      const embed = buildSteamEmbed(item);
      await sendEmbedToChannel(client, embed);
      console.log('[Steam] Nuevo descuento:', item.title, item.discountPercent);
    }
  }
}

function startScheduler(client) {
  cron.schedule(config.cronExpr, () => {
    checkAll(client).catch(err => console.error('Error en cron:', err.message));
  });
}

module.exports = { startScheduler, checkAll };
