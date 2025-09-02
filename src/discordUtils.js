// src/discordUtils.js
import { EmbedBuilder } from 'discord.js';
import { config } from './config.js';

// Construye embed para Epic
export function buildEpicEmbed(item) {
  return new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setDescription(item.description || 'Gratis por tiempo limitado')
    .setColor(0x57f287)
    .setImage(item.thumbnail);
}

// Construye embed para Steam
export function buildSteamEmbed(item) {
  return new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setDescription(item.description || `Descuento: ${item.discountPercent}%`)
    .setColor(0x1e90ff)
    .setImage(item.thumbnail);
}

// Envía embed al canal principal
export async function sendEmbedToChannel(client, embed) {
  try {
    const channel = await client.channels.fetch(config.channelId);
    if (!channel) throw new Error('Canal principal no encontrado');
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Error enviando embed:', err.message);
  }
}
