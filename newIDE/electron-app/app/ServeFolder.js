const liveServer = require('live-server');
const httpsConfiguration = require('./Utils/DevServerHttpsConfiguration.js');
const os = require('os');
const net = require('net');

let currentServerParams = null;

const getAvailablePort = startingAt => {
  const getNextAvailablePort = (currentPort, cb) => {
    const server = net.createServer();
    server.listen(currentPort, () => {
      server.once('close', () => {
        cb(currentPort);
      });
      server.close();
    });
    server.on('error', () => {
      getNextAvailablePort(++currentPort, cb);
    });
  };

  return new Promise(resolve => {
    getNextAvailablePort(startingAt, resolve);
  });
};

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
    getAvailablePort(2929).then(
      port => {
        currentServerParams = {
          port,
          root,
          open: false,
          wait: 1000,
          https: useHttps ? httpsConfiguration : undefined,
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

  getLocalNetworkIps: () => {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
          addresses.push(address.address);
        }
      }
    }

    return addresses;
  },
};
