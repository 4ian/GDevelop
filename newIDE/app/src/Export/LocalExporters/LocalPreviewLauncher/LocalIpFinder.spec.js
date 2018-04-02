import { findLocalIp } from './LocalIpFinder';

describe('LocalIpFinder', () => {
  it('can find the local ip in an array of ips', () => {
    expect(findLocalIp(['192.168.0.1'])).toBe('192.168.0.1');
    expect(findLocalIp(['127.0.0.1', '192.168.0.1'])).toBe('192.168.0.1');
    expect(findLocalIp(['96.0.0.1', '192.168.0.1'])).toBe('192.168.0.1');
    expect(findLocalIp(['96.0.0.1', '192.100.0.1'])).toBe('192.100.0.1');
    expect(findLocalIp(['96.0.0.1', '2'])).toBe('96.0.0.1');
    expect(findLocalIp([])).toBe(null);
  });
});
