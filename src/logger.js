import { EmbedBuilder } from 'discord.js';
import { config } from './config.js';
import { client } from './discordClient.js';

export async function logToDiscord(message, type = 'info') {
  try {
    if (!config.logChannelId) {
      console.log('⚠️ LOG_CHANNEL_ID no definido. Mensaje de log:', message);
      return;
    }

    const channel = await client.channels.fetch(config.logChannelId);
    if (!channel) {
      console.log('⚠️ Canal de logs no encontrado. Mensaje:', message);
      return;
    }

    let color;
    switch (type) {
      case 'success': color = 0x57f287; break; // verde
      case 'error':   color = 0xed4245; break; // rojo
      case 'warn':    color = 0xedb324; break; // amarillo
      default:        color = 0x7289da;        // azul Discord
    }

    const embed = new EmbedBuilder()
      .setTitle('🎮 Free Games Log')
      .setDescription(message)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Error enviando log al canal:', err.message);
    console.log('Mensaje original:', message);
  }
}
