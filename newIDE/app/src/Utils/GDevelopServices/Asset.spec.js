// @flow
import {
  extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl,
  isEffectAssetMadeFor,
  type AssetShortHeader,
  type EffectTarget,
} from './Asset';

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

  describe('isEffectAssetMadeFor', () => {
    const makeEffectAssetShortHeader = (
      effectTargets: ?Array<EffectTarget>
    ): AssetShortHeader => ({
      id: 'a1b2c3',
      name: 'Hit Flash',
      shortDescription: '',
      previewImageUrls: [],
      tags: [],
      license: '',
      objectType: 'HslAdjustment',
      animationsCount: 0,
      maxFramesCount: 0,
      width: 0,
      height: 0,
      dominantColors: [],
      ...(effectTargets ? { effectTargets } : {}),
    });

    it('is made for objects and layers when it does not say', () => {
      const assetShortHeader = makeEffectAssetShortHeader(null);
      expect(isEffectAssetMadeFor(assetShortHeader, 'object')).toBe(true);
      expect(isEffectAssetMadeFor(assetShortHeader, 'layer')).toBe(true);
    });

    it('is only made for what it lists', () => {
      const assetShortHeader = makeEffectAssetShortHeader(['object']);
      expect(isEffectAssetMadeFor(assetShortHeader, 'object')).toBe(true);
      expect(isEffectAssetMadeFor(assetShortHeader, 'layer')).toBe(false);
    });
  });
});
