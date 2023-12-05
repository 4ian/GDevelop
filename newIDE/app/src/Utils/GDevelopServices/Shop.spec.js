// @flow
import { extractDecodedFilenameWithExtensionFromProductAuthorizedUrl } from './Shop';

describe('Shop service', () => {
  describe('extractDecodedFilenameFromProductAuthorizedUrl', () => {
    it('works if asset file has an extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if game template file has an extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-game-templates.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if file has no extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download?token=1234567890'
        )
      ).toStrictEqual('file-to-download');
    });
    it('works if url is encoded', () => {
      expect(
        extractDecodedFilenameWithExtensionFromProductAuthorizedUrl(
          'https://private-game-templates.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file%20to%20download.png?token=1234567890'
        )
      ).toStrictEqual('file to download.png');
    });
  });
});
