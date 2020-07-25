const net = require('net');

const getAvailablePort = (startingAt, limit) => {
  const getNextAvailablePort = (currentPort, onFound, onError) => {
    const server = net.createServer();
    server.listen(currentPort, () => {
      server.once('close', () => {
        onFound(currentPort);
      });
      server.close();
    });
    server.on('error', () => {
      if (currentPort >= limit) {
        onError(
          new Error(
            'Tried all ports between ' +
              startingAt +
              ' and ' +
              limit +
              ' - stopping.'
          )
        );
        return;
      }
      getNextAvailablePort(++currentPort, onFound, onError);
    });
  };

  return new Promise((resolve, reject) => {
    getNextAvailablePort(startingAt, resolve, reject);
  });
};

module.exports = {
  getAvailablePort,
};
