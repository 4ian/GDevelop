// @flow
import { extractFilenameFromProductAuthorizedUrl } from './Shop';

describe('Shop service', () => {
  describe('extractFilenameFromProductAuthorizedUrl', () => {
    it('works if file has an extension', () => {
      expect(
        extractFilenameFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toBe('file-to-download.png');
    });
    it('works if file has no extension', () => {
      expect(
        extractFilenameFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download?token=1234567890'
        )
      ).toBe('file-to-download');
    });
  });
});
