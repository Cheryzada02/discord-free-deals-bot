require('dotenv').config();

const config = {
  discordToken: process.env.DISCORD_TOKEN,
  channelId: process.env.CHANNEL_ID,
  cronExpr: process.env.CHECK_CRON || '*/30 * * * *',
  userAgent: process.env.USER_AGENT
};

module.exports = config;
