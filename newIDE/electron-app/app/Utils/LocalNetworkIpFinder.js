const os = require('os');

/** @returns {string[]} */
const getLocalNetworkIps = () => {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, interfaces]) =>
      name.match(/^(VirtualBox|VMware)/) ? [] : interfaces
    )
    .filter(({ family, internal }) => family === 'IPv4' && !internal)
    .map(({ address }) => address);
};

/**
 * Returns null if not connected to internet with an IPv4 connection.
 * @returns {?string}
 */
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
