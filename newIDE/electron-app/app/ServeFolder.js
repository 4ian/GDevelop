const liveServer = require('live-server');
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const { getAvailablePort } = require('./Utils/AvailablePortFinder');

let currentServerParams = null;

module.exports = {
  /**
   * Start a server to serve a folder
   */
  serveFolder: ({ root, useHttps }, onDone) => {
    if (currentServerParams && currentServerParams.root === root) {
      onDone(null, currentServerParams);
      return;
    }

    liveServer.shutdown();
    getAvailablePort(2929, 4000).then(
      port => {
        currentServerParams = {
          port,
          root,
          open: false,
          wait: 1000,
          https: useHttps ? httpsConfiguration : undefined,
          // Disable the "live-reloading" by watching nothing, because
          // the hot-reloading built into the game engine is what should
          // be used - and the user can still reload manually on its browser.
          watch: [],
        };
        liveServer.start(currentServerParams);
        onDone(null, currentServerParams);
      },
      err => onDone(err)
    );
  },

  /**
   * Stop any running server
   */
  stopServer: onDone => {
    liveServer.shutdown();
    currentServerParams = null;

    onDone();
  },
};
