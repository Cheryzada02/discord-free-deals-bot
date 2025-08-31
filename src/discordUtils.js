const { EmbedBuilder } = require('discord.js');
const config = require('./config');

function buildEpicEmbed(item) {
  const embed = new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setTimestamp(new Date(item.startDate || Date.now()))
    .setFooter({ text: 'Epic Games' });

  if (item.type === 'free') {
    embed.setDescription(`🎁 ¡Gratis hasta: ${new Date(item.endDate).toLocaleString()}!`);
  }
  if (item.type === 'upcoming') {
    embed.setDescription(`📅 Próximo gratis desde: ${new Date(item.startDate).toLocaleString()}`);
  }
  if (item.image) embed.setImage(item.image);

  return embed;
}

function buildSteamEmbed(item) {
  const embed = new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setDescription(item.discountPercent ? `🔖 ${item.discountPercent} — ${item.finalPrice}` : `${item.finalPrice || ''}`)
    .setFooter({ text: 'Steam' })
    .setTimestamp();

  if (item.image) embed.setThumbnail(item.image);

  return embed;
}

// Ahora recibe client como parámetro
async function sendEmbedToChannel(client, embed) {
  if (!client || !client.isReady()) return;
  const channel = await client.channels.fetch(config.channelId).catch(() => null);
  if (!channel) return;
  await channel.send({ embeds: [embed] });
}

module.exports = { buildEpicEmbed, buildSteamEmbed, sendEmbedToChannel };
