// src/discordClient.js
import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
