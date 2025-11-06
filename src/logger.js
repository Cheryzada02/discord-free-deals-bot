// src/logger.js
import { EmbedBuilder } from 'discord.js';
import { config } from './config.js';

export async function logToDiscord(client, message, type = 'info') {
  const prefix = type.toUpperCase().padEnd(7);
  console.log(`[${prefix}] ${message}`);

  if (!config.logChannelId) return;
  if (!client.isReady()) return;

  try {
    const channel =
      client.channels.cache.get(config.logChannelId) ||
      (await client.channels.fetch(config.logChannelId));

    if (!channel) return;

    const colorMap = { success: 0x57f287, error: 0xed4245, warn: 0xedb324, info: 0x7289da };
    const color = colorMap[type] || colorMap.info;

    const txt = String(message);
    const safeMessage = txt.length > 4000 ? txt.slice(0, 4000) + '…' : txt;

    const embed = new EmbedBuilder()
      .setTitle('Free Games Log')
      .setDescription(safeMessage)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Error enviando log al canal:', err);
  }
}
