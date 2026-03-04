const { Client } = require('@xhayper/discord-rpc');

const discordClient = new Client({
  clientId: '718194112775454720',
});

discordClient.on('error', _ => true); // Ignore error: They happen only when the discord client is not installed

// Connect to Discord
discordClient.login().catch(() => {
  // Ignore connection errors - Discord client might not be installed
});

module.exports = function(ipc) {
  // Set-up Discord Rich Presence event:
  ipc.on('update-discord-rich-presence', (event, config) => {
    if (discordClient.user) {
      discordClient.user.setActivity(config).catch(() => {
        // Ignore errors silently
      });
    }
  });
};
