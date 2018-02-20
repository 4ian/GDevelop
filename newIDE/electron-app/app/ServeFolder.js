const serve = require('serve');
const ip = require('ip');
var os = require('os');

let server = null;

module.exports = {
  /**
   * Start a server to serve a folder
   */
  serveFolder: ({ localDir, port }, onDone) => {
    if (server) server.stop();

    server = serve(localDir, {
      port: port,
      clipless: true,
    });
    onDone();
  },

  /**
   * Stop any running server
   */
  stopServer: onDone => {
    if (server) server.stop();
    server = null;

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
