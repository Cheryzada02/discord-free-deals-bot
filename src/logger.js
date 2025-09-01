import config from './config.js';

export async function sendLog(client, message) {
  try {
    const channel = await client.channels.fetch(config.logChannelId);
    if (channel) {
      await channel.send(`📄 ${message}`);
    } else {
      console.log('⚠️ Canal de logs no encontrado');
    }
  } catch (err) {
    console.error('Error enviando log al canal:', err.message);
  }
}
