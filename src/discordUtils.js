// src/discordUtils.js
import { EmbedBuilder } from 'discord.js';
import { config } from './config.js';

// Builder genérico con imagen prioritaria
function buildEmbed({ title, url, description, image, thumbnail, color, fields = [] }) {
  if (!title || !url) throw new Error('Faltan datos obligatorios para construir el embed');

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setURL(url)
    .setDescription(description)
    .setColor(color);

  if (image) embed.setImage(image);
  else if (thumbnail) embed.setThumbnail(thumbnail);

  if (fields.length) embed.addFields(fields);
  return embed;
}

// Epic: SOLO gratis
export function buildEpicEmbed(item) {
  const image =
    item.image ||
    item.thumbnail ||
    item.keyImages?.find?.(k => /OfferImage|DieselStoreFrontWide/i.test(k.type))?.url ||
    null;

  return buildEmbed({
    title: item.title,
    url: item.url,
    description: item.description || 'Gratis por tiempo limitado',
    image,
    thumbnail: item.thumbnail || null,
    color: 0x57f287
  });
}

// Steam: rebajas / bajadas de precio
export function buildSteamEmbed(item) {
  const image = item.image || item.headerImage || item.thumbnail || null;
  const desc = item.description
    || (typeof item.discountPercent === 'number' ? `Descuento: ${item.discountPercent}%` : 'Oferta disponible');

  const fields = [];
  if (item.originalPriceFormatted && item.finalPriceFormatted) {
    fields.push(
      { name: 'Antes', value: item.originalPriceFormatted, inline: true },
      { name: 'Ahora', value: item.finalPriceFormatted, inline: true }
    );
  }

  return buildEmbed({
    title: item.title,
    url: item.url,
    description: desc,
    image,
    thumbnail: item.thumbnail || null,
    color: 0x1e90ff,
    fields
  });
}

// Envía 1 o varios embeds
export async function sendEmbedToChannel(client, embedOrEmbeds) {
  const channel = await client.channels.fetch(config.channelId);
  if (!channel) throw new Error('Canal principal no encontrado');

  const payload = Array.isArray(embedOrEmbeds)
    ? { embeds: embedOrEmbeds }
    : { embeds: [embedOrEmbeds] };

  await channel.send(payload);
}
