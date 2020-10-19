const os = require('os');

/** @returns {string[]} */
const getLocalNetworkIps = () => {
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
};

/** @returns {?string} */
const findLocalIp = () => {
  const ipAddresses = getLocalNetworkIps();

  if (!ipAddresses.length) return null;

  let firstLocalIp = ipAddresses.find(
    ipAddress => ipAddress.indexOf('192.168') === 0
  );
  if (firstLocalIp) return firstLocalIp;

  firstLocalIp = ipAddresses.find(ipAddress => ipAddress.indexOf('192') === 0);
  if (firstLocalIp) return firstLocalIp;

  return ipAddresses[0];
};

module.exports = {
  findLocalIp,
};
