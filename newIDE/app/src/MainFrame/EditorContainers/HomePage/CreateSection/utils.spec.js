// @flow
import { getExampleAndTemplateTiles } from './utils';

// Mock the tile components to avoid pulling in their full dependency tree.
jest.mock('../../../../AssetStore/ShopTiles', () => ({
  ExampleTile: 'ExampleTile',
  PrivateGameTemplateTile: 'PrivateGameTemplateTile',
}));

const makeExampleNoThumbnail = (id: string, score: ?number): any => ({
  item: {
    id,
    slug: id,
    name: id,
    fullName: id,
    shortDescription: '',
    description: '',
    license: 'MIT',
    tags: [],
    previewImageUrls: [], // no thumbnail
    gdevelopVersion: '5.0',
    codeSizeLevel: 'small',
  },
  matches: [],
  score,
});

const makeExample = (id: string, score: ?number): any => ({
  item: {
    id,
    slug: id,
    name: id,
    fullName: id,
    shortDescription: '',
    description: '',
    license: 'MIT',
    tags: [],
    previewImageUrls: ['https://example.com/preview.png'],
    gdevelopVersion: '5.0',
    codeSizeLevel: 'small',
  },
  matches: [],
  score,
});

const makeTemplate = (id: string, score: ?number): any => ({
  item: {
    id,
    sellerId: 'seller1',
    isSellerGDevelop: false,
    productType: 'GAME_TEMPLATE',
    listing: 'GAME_TEMPLATE',
    name: id,
    description: '',
    categories: [],
    updatedAt: '2024-01-01',
    createdAt: '2024-01-01',
    thumbnailUrls: [],
    prices: [],
    sellerStripeAccountId: '',
    stripeProductId: '',
    appStoreProductId: null,
    creditPrices: [],
  },
  matches: [],
  score,
});

const mockCallbacks = ({
  onSelectPrivateGameTemplateListingData: jest.fn(),
  onSelectExampleShortHeader: jest.fn(),
  i18n: {},
  gdevelopTheme: {},
}: any);

const getTileIds = (tiles: any[]) =>
  tiles.map(tile => tile && tile.key).filter(Boolean);

describe('getExampleAndTemplateTiles', () => {
  describe('when searching (isSearchActive = true)', () => {
    it('should place a template before an example when the template has a better score', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [makeTemplate('t1', 0.1)],
        exampleShortHeaders: [makeExample('e1', 0.5)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: true,
      });

      const ids = getTileIds(tiles);
      expect(ids[0]).toBe('t1'); // template score 0.1 beats example score 0.5
      expect(ids[1]).toBe('e1');
    });

    it('should place an example before a template when the example has a better score', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [makeTemplate('t1', 0.6)],
        exampleShortHeaders: [makeExample('e1', 0.2)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: true,
      });

      const ids = getTileIds(tiles);
      expect(ids[0]).toBe('e1'); // example score 0.2 beats template score 0.6
      expect(ids[1]).toBe('t1');
    });

    it('should prefer examples over templates when scores are tied', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [makeTemplate('t1', 0.5)],
        exampleShortHeaders: [makeExample('e1', 0.5)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: true,
      });

      const ids = getTileIds(tiles);
      expect(ids[0]).toBe('e1');
      expect(ids[1]).toBe('t1');
    });

    it('should interleave multiple results in score order', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [
          makeTemplate('t1', 0.0),
          makeTemplate('t2', 0.4),
        ],
        exampleShortHeaders: [makeExample('e1', 0.2), makeExample('e2', 0.6)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: true,
      });

      expect(getTileIds(tiles)).toEqual(['t1', 'e1', 't2', 'e2']);
    });

    it('should not reorder owned templates to the front during search', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        // $FlowFixMe[incompatible-type]
        receivedGameTemplates: [{ id: 'owned-template' }],
        privateGameTemplateListingDatas: [makeTemplate('owned-template', 0.9)],
        exampleShortHeaders: [makeExample('relevant-example', 0.1)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: true,
        isSearchActive: true,
      });

      const ids = getTileIds(tiles);
      // Relevance order must be respected even though the template is owned.
      expect(ids[0]).toBe('relevant-example');
      expect(ids[1]).toBe('owned-template');
    });
  });

  it('should place examples without thumbnails at the end regardless of their score', () => {
    const tiles = getExampleAndTemplateTiles({
      ...mockCallbacks,
      receivedGameTemplates: null,
      privateGameTemplateListingDatas: [makeTemplate('t1', 0.9)],
      exampleShortHeaders: [
        makeExampleNoThumbnail('no-thumb', 0.0), // best score but no thumbnail
        makeExample('e1', 0.5),
      ],
      privateGameTemplatesPeriodicity: 1,
      showOwnedGameTemplatesFirst: false,
      isSearchActive: true,
    });

    const ids = getTileIds(tiles);
    // no-thumb has the best score (0.0) but should still appear last
    expect(ids[ids.length - 1]).toBe('no-thumb');
  });

  describe('when browsing (isSearchActive = false)', () => {
    it('should place examples first with fixed interleaving (no template at position 0)', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [makeTemplate('t1', undefined)],
        exampleShortHeaders: [
          makeExample('e1', undefined),
          makeExample('e2', undefined),
        ],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: false,
      });

      const ids = getTileIds(tiles);
      // The interleaving algorithm delays templates: e1 first (index 0, no template),
      // then e2 and t1 together (index 1).
      expect(ids[0]).toBe('e1');
      expect(ids.indexOf('e2')).toBeLessThan(ids.indexOf('t1'));
    });

    it('should return an empty array when both lists are empty', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        receivedGameTemplates: null,
        privateGameTemplateListingDatas: [],
        exampleShortHeaders: [],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: false,
        isSearchActive: false,
      });

      expect(tiles).toEqual([]);
    });

    it('should reorder owned templates to the front when browsing', () => {
      const tiles = getExampleAndTemplateTiles({
        ...mockCallbacks,
        // $FlowFixMe[incompatible-type]
        receivedGameTemplates: [{ id: 'owned-template' }],
        privateGameTemplateListingDatas: [
          makeTemplate('unowned-template', undefined),
          makeTemplate('owned-template', undefined),
        ],
        exampleShortHeaders: [makeExample('e1', undefined)],
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: true,
        isSearchActive: false,
      });

      const ids = getTileIds(tiles);
      expect(ids.indexOf('owned-template')).toBeLessThan(
        ids.indexOf('unowned-template')
      );
    });
  });
});
