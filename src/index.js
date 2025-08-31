const { client } = require('./discordClient');
const { startScheduler, checkAll } = require('./scheduler');

// Esperamos a que el cliente esté listo
client.once('ready', async () => {
  console.log(`✅ Bot listo: ${client.user.tag}`);

  // Cambiar presencia a "Viendo ofertas gratis"
  client.user.setPresence({
    activities: [{ name: 'ofertas gratis', type: 3 }], // 3 = Watching
    status: 'online'
  });

  try {
    console.log('[Startup] Comprobando ofertas inmediatamente...');
    await checkAll(client);
  } catch (err) {
    console.error('Error en el chequeo inicial:', err.message);
  }

  startScheduler(client);
});

// Login del bot
const config = require('./config');
client.login(config.discordToken).catch(err => {
  console.error('Error al login:', err.message);
});
