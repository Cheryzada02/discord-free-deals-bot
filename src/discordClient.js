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

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

export async function initializeClient() {
  try {
    await client.login(config.discordToken);
    console.log('✅ Discord client logged in successfully');
  } catch (error) {
    console.error('❌ Failed to login Discord client:', error);
    process.exit(1);
  }
}
