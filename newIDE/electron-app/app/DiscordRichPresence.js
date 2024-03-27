const discordClient = require('discord-rich-presence')('718194112775454720');
discordClient.on("error", _ => true); // Ignore error: They happen only when the discord client is not installed

module.exports = function(ipc) {
    // Set-up Discord Rich Presence event:
    ipc.on('update-discord-rich-presence', (event, config) => discordClient.updatePresence(config));
}
