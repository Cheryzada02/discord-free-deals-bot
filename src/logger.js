import { EmbedBuilder } from "discord.js";

export async function logToDiscord(client, message, type = "info") {
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;

    if (!logChannelId) {
      console.log("⚠️ LOG_CHANNEL_ID no definido. Mensaje de log:", message);
      return;
    }

    const channel = await client.channels.fetch(logChannelId);
    if (!channel) {
      console.log("⚠️ Canal de logs no encontrado. Mensaje:", message);
      return;
    }

    // ✅ Elegir color según tipo
    let color;
    switch (type) {
      case "success":
        color = 0x57f287; // verde
        break;
      case "error":
        color = 0xed4245; // rojo
        break;
      case "warn":
        color = 0xedb324; // amarillo
        break;
      default:
        color = 0x7289da; // azul Discord
    }

    const embed = new EmbedBuilder()
      .setTitle("📢 Free Games Log")
      .setDescription(message)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    console.log(`✅ Log enviado: ${message}`);
  } catch (err) {
    console.error("❌ Error enviando log al canal:", err.message);
    console.log("Mensaje original:", message);
  }
}
