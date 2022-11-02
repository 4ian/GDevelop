// @flow
import { extractFilenameWithExtensionFromProductAuthorizedUrl } from './Shop';

describe('Shop service', () => {
  describe('extractFilenameAndExtensionFromProductAuthorizedUrl', () => {
    it('works if file has an extension', () => {
      expect(
        extractFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if file has no extension', () => {
      expect(
        extractFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download?token=1234567890'
        )
      ).toStrictEqual('file-to-download');
    });
  });
});
