// @flow

export const findLocalIp = (ipAddresses: Array<string>): ?string => {
  if (!ipAddresses.length) return null;

  let firstLocalIp = ipAddresses.find(
    ipAddress => ipAddress.indexOf('192.168') === 0
  );
  if (firstLocalIp) return firstLocalIp;

  firstLocalIp = ipAddresses.find(ipAddress => ipAddress.indexOf('192') === 0);
  if (firstLocalIp) return firstLocalIp;

  return ipAddresses[0];
};
