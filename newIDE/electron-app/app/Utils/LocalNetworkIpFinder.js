const os = require('os');

/**
 * As defined in RFC 1918, the following IPv4 address ranges are reserved for private networks:
 * https://datatracker.ietf.org/doc/html/rfc1918#section-3
 *
 * @param {string} ip
 * @returns {boolean}
 */
const isPrivateIp = ip => {
  const [first, second] = ip.split('.').map(Number);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

/** @returns {string[]} */
const getLocalNetworkIps = () => {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, interfaces]) =>
      name.match(/^(VirtualBox|VMware)/) ? [] : interfaces
    )
    .filter(
      ({ family, internal, address }) =>
        family === 'IPv4' && !internal && isPrivateIp(address)
    )
    .map(({ address }) => address);
};

/**
 * Returns null if not connected to internet with an IPv4 connection.
 * @returns {?string}
 */
const findLocalIp = () => {
  const ipAddresses = getLocalNetworkIps();

  if (!ipAddresses.length) return null;

  return ipAddresses[0];
};

module.exports = {
  findLocalIp,
};
