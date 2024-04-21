// @flow
import { extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl } from './Asset';

describe('Asset service', () => {
  describe('extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl', () => {
    it('throws if not the right URL format', () => {
      expect(() =>
        extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
          'https://private-assets.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/file-to-download.png?token=1234567890'
        )
      ).toThrow();
    });
    it('works if file has an extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
          'https://asset-resources.gdevelop.io/public-resources/Pack name/b540a2c4b3a4d9a856819eb522473380fa98291e2f59fcf8905d99649a5b179b_file-to-download.png'
        )
      ).toStrictEqual('file-to-download.png');
    });
    it('works if file has no extension', () => {
      expect(
        extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
          'https://asset-resources.gdevelop.io/public-resources/Pack name/b540a2c4b3a4d9a856819eb522473380fa98291e2f59fcf8905d99649a5b179b_file-to-download'
        )
      ).toStrictEqual('file-to-download');
    });
    it('works if url is encoded', () => {
      expect(
        extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
          'https://asset-resources.gdevelop.io/public-resources/Pack%20name/b540a2c4b3a4d9a856819eb522473380fa98291e2f59fcf8905d99649a5b179b_file%20to%20download.png'
        )
      ).toStrictEqual('file to download.png');
    });
    it('works if url is not encoded', () => {
      expect(
        extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
          'https://asset-resources.gdevelop.io/public-resources/Pack name/b540a2c4b3a4d9a856819eb522473380fa98291e2f59fcf8905d99649a5b179b_file to download.png'
        )
      ).toStrictEqual('file to download.png');
    });
  });
});
